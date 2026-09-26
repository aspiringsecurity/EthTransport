# Trust-Aware Agent Coordination for Decentralized Finance: A libp2p + Uniswap V4 Implementation

## Abstract

This paper presents a working implementation of trust-aware networking primitives for autonomous DeFi agent coordination, built on rust-libp2p and Uniswap V4 hooks. The system demonstrates how composite reputation scoring, cryptographic identity binding, reputation-gated execution, and multi-agent coordination protocols can be composed to enable trust-minimized, peer-to-peer swap coordination on Ethereum. With deployed contracts on Sepolia, and Filecoin-based archival of execution traces, the implementation provides a concrete reference for trust infrastructure in decentralized agent networks.

---

## 1. Motivation

### 1.1 The Trust Gap in Agent-to-Agent Coordination

As autonomous agents increasingly participate in DeFi markets — executing swaps, providing liquidity, and coordinating trades — the infrastructure for agent-to-agent trust remains underdeveloped. Existing DEX protocols assume human users interacting through frontends, not autonomous agents coordinating through P2P networks.

The core challenge: how can agents evaluate counterparty reliability, coordinate multi-party transactions, and build verifiable track records without centralized intermediaries?

### 1.2 Coasean Transaction Costs

Ronald Coase's framework identifies transaction costs as the primary friction in economic coordination. For agent-to-agent DeFi, these costs manifest as:

- **Search costs**: Finding reliable counterparties across a decentralized network
- **Verification costs**: Confirming counterparty identity and on-chain capability
- **Enforcement costs**: Ensuring follow-through on coordinated actions
- **Reputation costs**: Distinguishing good actors from bad in pseudonymous environments

This implementation directly addresses each cost through purpose-built networking primitives.

### 1.3 libp2p as Trust Infrastructure

libp2p provides the foundational networking layer — gossipsub for topic-based messaging, mDNS for local discovery, and peer scoring for network-level reputation. By extending these primitives with application-specific trust semantics, we bridge the gap between P2P connectivity and DeFi coordination.

---

## 2. Architecture

### 2.1 System Overview

The system consists of three layers:

1. **Networking Layer** (rust-libp2p 0.54): Gossipsub messaging across two topics (`v4-swap-agents` for swaps/coordination, `v4-swap-intents` for pre-trade signaling), mDNS discovery, TCP+QUIC transports, and integrated peer scoring.

2. **Trust Layer** (application): Composite reputation scoring, EIP-191 identity binding, trust levels, misbehavior penalties, and reputation-gated execution logic.

3. **Execution Layer** (Ethereum/Uniswap V4): On-chain swap execution through AgentCounter hooks, with dynamic fee rebates based on agent history. Three execution modes: live Sepolia, simulation (synthetic hashes), and local Anvil fork.

### 2.2 Message Flow

```
Agent A                          Agent B
  │                                │
  ├─ Identity Attestation ────────►│  (auto on connect)
  │◄──── Identity Attestation ─────┤
  │                                │
  ├─ SwapIntent ──────────────────►│  (pre-trade signal)
  │       500ms flush              │
  ├─ SwapExecuted ────────────────►│  (post-trade broadcast)
  │                                │
  │  ┌─ Reputation Updated ────┐   │  (local scoring)
  │  └─ P5 Score Refreshed ────┘   │
  │                                │
  ├─ SwapProposal ────────────────►│  (coordination)
  │◄──── SwapAcceptance ───────────┤
  ├─ SwapExecuted (coordinated) ──►│
  │                                │
```

---

## 3. Trust Primitives

### 3.1 Identity Binding (PeerId <-> EOA)

**Problem**: In pseudonymous P2P networks, agents can trivially create multiple identities (Sybil attack). Without linking P2P identities to on-chain addresses, reputation is meaningless.

**Solution**: EIP-191 `personal_sign` attestation. Each agent signs the message `"libp2p-v4-swap-agents:identity:{peer_id}"` with their Ethereum private key. The signed attestation is broadcast over gossipsub on every peer connection. Receiving peers verify the signature using `recover_address_from_msg` and store the binding in a local `PeerRegistry`.

**Properties**:
- Cryptographic proof of PeerId <-> EOA control
- Automatic exchange on connection (no manual attestation step)
- Replay-safe (PeerId is unique per session)
- Feeds into reputation scoring (identity_verified weight: 20%)

### 3.2 Composite Reputation Scoring

**Problem**: Simple swap-count reputation is gameable. A more nuanced scoring model is needed to capture multiple dimensions of trustworthiness.

**Solution**: Four-factor weighted composite score:

| Factor | Weight | Description |
|--------|--------|-------------|
| Swap Count | 0.40 | `min(swap_count, 50) / 50` — normalized successful swap history |
| Identity Verified | 0.20 | Binary — 1.0 if PeerId <-> EOA binding verified, 0.0 otherwise |
| Follow-Through Rate | 0.25 | `swap_count / intent_count` — 0.0 when no activity, 1.0 when swaps exist without intents |
| Recency | 0.15 | `2^(-hours_since_last_swap / 24)` — 24-hour half-life decay |

**Composite score** = `(w1*swap + w2*identity + w3*follow_through + w4*recency) - penalty_score`

**Penalty deductions** (subtractive, capped at 0.5):
- Invalid message: -0.05 per occurrence
- Unfollowed intent: -0.03 per occurrence
- Expired proposal: -0.02 per occurrence

**Trust levels** map score ranges to semantic categories:

| Level | Score Range | Coordination Access |
|-------|-------------|-------------------|
| Unknown | ≤ 0.0 | Blocked from proposals |
| Low | ≤ 0.3 | Basic messaging only |
| Medium | ≤ 0.6 | Full coordination |
| High | ≤ 0.85 | Full coordination |
| Trusted | > 0.85 | Full coordination |

### 3.3 Gossipsub Peer Scoring Integration

**Problem**: Application-level reputation must feed into the network layer to affect message propagation and mesh maintenance.

**Solution**: Three gossipsub scoring parameters configured:

- **P4 (Invalid Message Deliveries)**: Weight -10.0, decay 0.9. Triggered when `report_message_validation_result` returns `Reject` (malformed JSON, unknown message types). Requires `validate_messages()` enabled on gossipsub config.

- **P5 (Application-Specific Score)**: Weight 1.0. Fed by `set_application_score(peer_id, composite_score * 100)` every 30 seconds. This bridges the application reputation store to gossipsub's mesh scoring.

- **P7 (Behaviour Penalty)**: Weight -1.0, threshold 1.0, decay 0.9. General-purpose penalty for protocol-level misbehavior.

A 30-second periodic refresh cycle:
1. Iterates all known peers via `all_scores()`
2. Feeds composite scores to gossipsub P5 via `set_application_score()`
3. Runs `cleanup_expired_with_initiators()` to penalize expired proposal initiators
4. Runs `cleanup_stale_peers()` to prune peers inactive for 7+ days

### 3.4 Conditional Execution (Reputation-Gated Swaps)

**Problem**: Agents need to enforce minimum trust requirements before executing trades, especially in coordination scenarios.

**Solution**: The `cswap` command accepts conditions:
- `--min-rep <score>`: Minimum reputation threshold (0.0 to 1.0)
- `--min-price <val>`: Price floor
- `--max-price <val>`: Price ceiling

Condition evaluation occurs locally before swap execution. If any condition fails, the swap is rejected with a specific reason:
```
[CSWAP] REJECTED: Reputation too low: 0.15 < 0.30 threshold
```

### 3.5 Multi-Agent Coordination (Propose/Accept/Execute)

**Problem**: Two-party swap coordination requires a structured protocol with reputation gates, timeouts, and state tracking.

**Solution**: Three-phase coordination protocol:

1. **Propose**: Agent A broadcasts `SwapProposal` with offer details and minimum reputation threshold for counterparties. Published over gossipsub.

2. **Accept**: Agent B evaluates the proposal against its own criteria, checks the proposer's reputation, and broadcasts `SwapAcceptance`. Trust gating: proposals from `TrustLevel::Unknown` peers are silently discarded.

3. **Execute**: On acceptance, the proposer executes the coordinated swap. The `CoordinationBook` tracks proposal state transitions: `Pending` -> `Accepted` -> `Filled` (or `Expired` after 60 seconds).

---

## 4. Mapping to ARIA Framework

The implementation maps to the Scaling Trust Programme's agent interaction stages:

### 4.1 Requirement Gathering
Agents broadcast **swap intents** with conditions (amount, direction, price bounds) over the `v4-swap-intents` gossipsub topic. The PendingSwap pattern ensures intents reach peers 500ms before execution, enabling reactive coordination.

### 4.2 Negotiation
**Coordinated swap proposals** implement structured negotiation. Agent A specifies what it offers and what it seeks, with a minimum reputation gate. Agent B evaluates and accepts or ignores. The proposal protocol provides clear state transitions and timeouts.

### 4.3 Security Reasoning
**Peer scoring and trust thresholds** implement security reasoning:
- Composite reputation evaluates counterparty reliability across 4 dimensions
- Trust gating blocks Unknown peers from coordination
- Gossipsub P4/P7 penalties reduce influence of misbehaving peers at the network level
- Misbehavior penalties (invalid messages, unfollowed intents, expired proposals) decay trust over time

### 4.4 Reporting
**Filecoin archival** provides immutable reporting:
- Swap execution logs (tx hash, agent, amounts, timestamp)
- Identity attestation records (PeerId <-> EOA bindings)
- Stored on Filecoin Calibration testnet via Synapse SDK
- Retrievable by PieceCID through CLI or browser

---

## 5. Implementation Details

### 5.1 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Networking | rust-libp2p | 0.54 |
| Smart Contracts | Solidity (Foundry) | 0.8.26 |
| Chain Interaction | Alloy | 0.3 |
| Archival | Synapse SDK (Node.js sidecar) | - |
| Target Chain | Ethereum Sepolia | - |
| DEX | Uniswap V4 | - |

### 5.2 Module Architecture

| Module | Lines | Responsibility |
|--------|-------|---------------|
| `main.rs` | ~1100 | Event loop, CLI, message handling, periodic refresh |
| `reputation.rs` | ~350 | Composite scoring, trust levels, penalties, store |
| `coordination.rs` | ~160 | Proposal lifecycle, coordination book |
| `network.rs` | ~155 | Gossipsub config, peer scoring params, behaviour |
| `identity.rs` | ~115 | EIP-191 signing, verification, peer registry |
| `uniswap.rs` | ~200 | On-chain swap client, pool keys, ABI |
| `archival.rs` | ~160 | Log entries, Filecoin sidecar integration |
| `sim.rs` | ~50 | Execution modes, synthetic tx hashes |
| `cli.rs` | ~20 | CLI argument parsing |

### 5.3 Test Coverage

109 Rust unit tests + 10 Solidity tests:

| Test Suite | Count | Coverage |
|-----------|-------|---------|
| Reputation | 34 | Scoring, penalties, trust levels, serde compat, cleanup |
| Network | 18 | Topics, gossipsub config, P4/P5/P7 params, thresholds |
| Coordination | 10 | Proposal lifecycle, expiry, initiator tracking |
| Identity | 6 | EIP-191 roundtrip, tampering, registry |
| Simulation | 9 | Mode switching, tx hash format |
| Archival | 8 | Log entries, buffer ops, sidecar errors |
| Uniswap | 24 | Pool keys, V1/V2 config |

### 5.4 Deployed Infrastructure

**Sepolia Testnet Contracts:**
- AgentCounter V1: `0x5D4505AA950a73379B8E9f1116976783Ba8340C0`
- AgentCounterV2: `0xA8760B755c67c5C75A8A60ED7E3713eA2448D0C0`
- Token A (TKNA): `0x7546360e0011Bb0B52ce10E21eF0E9341453fE71`
- Token B (TKNB): `0xF6d91478e66CE8161e15Da103003F3BA6d2bab80`

**Pool Configuration:**
- V1: Static fee 0.30% (3000), tick spacing 60, 1:1 price ratio
- V2: Dynamic fee (DYNAMIC_FEE_FLAG), 0.20% rebate after 5 swaps

---

## 6. Future Work

### 6.1 Request-Response Quotes
Before executing a swap, agents query peers for expected output using libp2p's request-response protocol. This enables price discovery without oracles and allows agents to compare P2P quotes with on-chain state.

### 6.2 MEV-Aware Coordination
Agents share swap intents privately over encrypted libp2p channels, coordinate execution timing with randomized delays, and batch transactions to reduce MEV extraction. The existing intent gossip and coordination protocols provide the foundation.

### 6.3 Delegated Execution
Agent A requests "execute this swap for me" over libp2p. Agent B executes and earns reputation (and potentially fees). This is the foundation for decentralized solver/relayer markets.

### 6.4 Cross-Chain Intent Propagation
Structure swap intents as chain-agnostic messages with target chain metadata. Agents on different chains can receive and fulfill intents, enabling cross-chain coordination through the same P2P network.

### 6.5 On-Chain Reputation Anchoring
Periodically anchor composite reputation scores on-chain via Uniswap V4 hook storage. This creates a tamper-resistant reputation ledger that survives agent restarts and enables cross-session trust continuity.

---

## 7. References

1. Coase, R.H. (1937). "The Nature of the Firm." *Economica*, 4(16), 386-405.
2. libp2p Gossipsub Specification. https://github.com/libp2p/specs/tree/master/pubsub/gossipsub
3. Uniswap V4 Hooks Documentation. https://docs.uniswap.org/contracts/v4/overview
4. EIP-191: Signed Data Standard. https://eips.ethereum.org/EIPS/eip-191
5. Filecoin Synapse SDK. https://github.com/FilOzone/synapse-sdk
6. rust-libp2p Documentation. https://docs.rs/libp2p/latest/libp2p/
7. Alloy — Ethereum Rust SDK. https://docs.rs/alloy/latest/alloy/

---

## Appendix A: Gossipsub Scoring Parameters

```
Topic Score Parameters (both topics):
  P1 (Time in Mesh):            weight = 0.1, quantum = 1s, cap = 100
  P2 (First Message Delivery):  weight = 1.0, decay = 0.5, cap = 1000
  P3 (Mesh Message Delivery):   weight = 0.0 (disabled)
  P4 (Invalid Messages):        weight = -10.0, decay = 0.9
  P5 (Application-Specific):    weight = 1.0

Peer Score Parameters:
  P7 (Behaviour Penalty):       weight = -1.0, threshold = 1.0, decay = 0.9

Thresholds:
  Gossip:    -100.0
  Publish:   -200.0
  Graylist:  -300.0
```

## Appendix B: Trust Level Distribution

```
Score Range     Trust Level     Coordination Access
─────────────────────────────────────────────────────
  ≤ 0.00        Unknown         Blocked (proposals ignored)
  ≤ 0.30        Low             Messaging only
  ≤ 0.60        Medium          Full coordination
  ≤ 0.85        High            Full coordination
  > 0.85        Trusted         Full coordination
```
