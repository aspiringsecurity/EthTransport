# Complete Demo Guide: Cycles 1-3

Full walkthrough covering every feature — from basic P2P chat and on-chain swaps through to trust-aware coordination. Designed for recording a demo video for the ARIA proposal.

## Table of Contents

1. [Overview](#overview)
2. [Pre-Demo Setup](#pre-demo-setup)
3. [Demo Scenarios](#demo-scenarios)
   - [Demo 1: Simulation Mode & P2P Chat](#demo-1-simulation-mode--p2p-chat)
   - [Demo 2: Swap Execution (V1 & V2)](#demo-2-swap-execution-v1--v2)
   - [Demo 3: Identity Binding](#demo-3-identity-binding-peerid--eoa)
   - [Demo 4: Swap Intent Gossip](#demo-4-swap-intent-gossip)
   - [Demo 5: Reputation Scoring](#demo-5-reputation-scoring)
   - [Demo 6: Conditional Swaps](#demo-6-conditional-swaps-reputation-gated)
   - [Demo 7: Coordinated Swaps](#demo-7-coordinated-swaps)
   - [Demo 8: Trust Gating & Peer Scoring](#demo-8-trust-gating--peer-scoring)
   - [Demo 9: Filecoin Archival](#demo-9-filecoin-archival)
   - [Demo 10: Full End-to-End Flow](#demo-10-full-end-to-end-flow)
4. [Recording Script](#recording-script)
5. [Troubleshooting](#troubleshooting)

---

## Overview

### All Features (Cycles 1-3)

**Cycle 1 — Foundation**
1. P2P chat over gossipsub
2. On-chain V1 swaps (AgentCounter hook)
3. V2 swaps with dynamic fee rebates (AgentCounterV2)
4. PeerId <-> EOA identity binding (EIP-191)

**Cycle 2 — Modes & Archival**
5. Simulation mode (synthetic tx hashes, no .env needed)
6. Local Anvil mode (real swaps, zero cost)
7. Swap intent gossip (PendingSwap pattern)
8. Filecoin archival (Synapse SDK sidecar)

**Cycle 3 — Trust & Coordination**
9. Composite reputation scoring with trust levels
10. Conditional swaps (reputation-gated)
11. Multi-agent coordinated swaps (propose/accept/execute)
12. Peer scoring heuristics (P4/P5/P7, trust gating, misbehavior penalties)

---

## Pre-Demo Setup

### 1. Build the Agent

```bash
cd agent
cargo build --release
```

### 2. Terminal Setup

Prepare 3-4 terminals:
- Terminal 1: Agent A
- Terminal 2: Agent B
- Terminal 3: Sidecar / Anvil (optional, for Demos 9 and local mode)
- Terminal 4: Browser (optional, for Filecoin view)

### 3. Display Settings

- Increase terminal font to 16-18pt for readability
- Use tmux or iTerm2 splits for side-by-side views
- Clear terminal history before starting

### 4. Environment Files (for live/local mode only)

```bash
# Root .env (for live Sepolia or local Anvil)
cp .env.example .env
# Edit with SEPOLIA_RPC_URL and PRIVATE_KEY

# Sidecar .env (for Filecoin archival)
cd sidecar && cp .env.example .env
# Edit with FILECOIN_PRIVATE_KEY
```

Simulation mode does NOT require any `.env` files.

---

## Demo Scenarios

### Demo 1: Simulation Mode & P2P Chat

**What this shows**: Agents communicate over gossipsub without any blockchain interaction — no wallet, no RPC, no gas.

**Terminal 1 — Agent A (Simulation)**
```bash
cd agent
cargo run -- --simulate
```

Expected output:
```
=== libp2p Uniswap V4 Swap Agent ===
Mode:    SIMULATION
Peer ID: 12D3KooW...
EOA:     0x817c...
Topic:   v4-swap-agents
Type 'help' for available commands.

Listening on /ip4/127.0.0.1/tcp/XXXXX
```

**Copy the TCP port** from the output.

**Terminal 2 — Agent B (Simulation)**
```bash
cd agent
cargo run -- --simulate /ip4/127.0.0.1/tcp/XXXXX
```

Both agents discover each other and connect:
```
Dialing /ip4/127.0.0.1/tcp/XXXXX...
Connected to peer: 12D3KooW...
```

**Chat — type a message in Agent A:**
```bash
hello from agent A
```

**Agent B sees:**
```
[12D3KooW...] hello from agent A
```

**Switch execution modes at runtime:**
```bash
sim off    # Switch to live mode (requires .env)
sim on     # Back to simulation
sim local  # Local Anvil mode (requires Anvil running)
```

**Key points:**
- No `.env` file needed in simulation mode
- Agents connect via TCP and QUIC transports
- mDNS provides automatic local discovery
- Chat messages flow over gossipsub topic `v4-swap-agents`

---

### Demo 2: Swap Execution (V1 & V2)

**What this shows**: Agents execute swaps and broadcast results to peers. V2 hook tracks agents correctly and gives fee rebates after 5 swaps.

**In Agent A — execute V1 swap:**
```bash
swap 1
```

Expected output:
```
[INTENT] Broadcast: 1 TKNA -> TKNB
[SIM] V1 swap: 1 TKNA -> TKNB
[SIM] tx: 0xSIM_XXXXX_...
```

**Agent B sees:**
```
[INTENT] Agent 12D3KooW... intends to swap 1 (TKNA -> TKNB) at HH:MM:SS UTC
[SWAP] Agent 12D3KooW... swapped 1 (TKNA -> TKNB) tx: 0xSIM_...
  https://sepolia.etherscan.io/tx/0xSIM_...
```

**V2 swap with reverse direction:**
```bash
swap-v2 1     # TKNA -> TKNB on V2 pool
swap-v2-b 1   # TKNB -> TKNA on V2 pool
swap-b 1      # TKNB -> TKNA on V1 pool
```

**Check on-chain status (live/local mode only):**
```bash
status        # V1 pool swap counts
status-v2     # V2 pool counts + your fee tier
```

**Key points:**
- Every swap auto-broadcasts an intent BEFORE execution (PendingSwap pattern)
- V1 and V2 pools available (V2 gives fee rebates after 5 swaps: 0.30% -> 0.20%)
- In simulation mode, tx hashes are synthetic (`0xSIM_...`)
- In live/local mode, real on-chain transactions are executed

---

### Demo 3: Identity Binding (PeerId <-> EOA)

**What this shows**: Agents cryptographically prove they control an Ethereum address. Identity exchange happens automatically on connection.

**In Agent A:**
```bash
who
```

Expected output:
```
PeerId: 12D3KooW...
EOA:    0x817cA93300590bF6AA0DFbFa592b055F7eb20090
```

**List all verified peer identities:**
```bash
peers
```

Expected output:
```
Verified peers (2):
  12D3KooW... -> 0x817c... [Trust: Low | Score: 0.35]
  12D3KooW... -> 0xf39F... [Trust: Low | Score: 0.35]
```

**Key points:**
- EIP-191 `personal_sign` links PeerId to ETH address
- Attestation auto-published on every `ConnectionEstablished` event
- Peers verify the signature before storing the binding
- Identity verification contributes 20% to reputation score

---

### Demo 4: Swap Intent Gossip

**What this shows**: Agents broadcast swap intentions BEFORE execution, enabling reactive coordination.

**In Agent A — broadcast intent without executing:**
```bash
intent 10 a2b 1.0 1.5
```

Expected output:
```
[INTENT] Broadcast: 10 TKNA -> TKNB (bounds: 1.00-1.50)
```

**Agent B sees:**
```
[INTENT] Agent 12D3KooW... intends to swap 10 (TKNA -> TKNB) bounds: 1.00-1.50 at HH:MM:SS UTC
```

**Now execute a swap (intent is auto-broadcast first):**
```bash
swap 2
```

**Agent B sees TWO messages in order:**
```
[INTENT] Agent 12D3KooW... intends to swap 2 (TKNA -> TKNB) at HH:MM:SS UTC
[SWAP] Agent 12D3KooW... swapped 2 (TKNA -> TKNB) tx: 0xSIM_...
```

**Key points:**
- Separate gossipsub topic: `v4-swap-intents`
- PendingSwap pattern: intent -> 500ms swarm flush -> swap execution
- Enables counter-swaps, liquidity provision, MEV protection
- Price bounds are optional

---

### Demo 5: Reputation Scoring

**What this shows**: Agents build reputation through successful swaps. Trust levels progress as swap history grows.

**Execute several swaps in Agent A:**
```bash
swap 1
swap 1
swap 1
```

**Check reputation in Agent A (own score):**
```bash
reputation
```

Expected output:
```
Peer reputations (2):
  12D3KooW... — Score: 0.50 | Trust: Medium | Swaps: 3 | ID: verified
  12D3KooW... — Score: 0.35 | Trust: Low | Swaps: 0 | ID: verified
```

Agents track their own activity — the first entry is Agent A's self-score including its 3 swaps and verified identity. The second entry is Agent B as seen by Agent A.

**Key points:**
- Agents track their own swaps, intents, and identity verification locally
- Composite score: swap count (40%), identity (20%), follow-through (25%), recency (15%)
- Follow-through is 0.0 when no activity exists (no free credit for new peers)
- Trust levels: Unknown (<=0), Low (<=0.3), Medium (<=0.6), High (<=0.85), Trusted (>0.85)
- Misbehavior penalties subtract from score (invalid messages, unfollowed intents, expired proposals)
- Penalties are capped at 0.5 to prevent permanent blacklisting
- 24-hour half-life recency decay

---

### Demo 6: Conditional Swaps (Reputation-Gated)

**What this shows**: Swaps can require minimum peer reputation before execution. The `cswap` command checks the agent's **own** reputation score against the threshold before executing.

**In Agent A — attempt a conditional swap with a high threshold:**
```bash
cswap 1 a2b --min-rep 0.9
```

Rejected because own score (~0.35 on startup) is below threshold:
```
[CSWAP] REJECTED: Reputation too low: 0.35 < 0.90 threshold
```

**Build reputation by executing swaps:**
```bash
swap 1
swap 1
swap 1
```

**Try with a reasonable threshold:**
```bash
cswap 1 a2b --min-rep 0.3
```

Expected output:
```
[CSWAP] Conditions met, executing...
[SIM] V1 swap: 1 TKNA -> TKNB
[SIM] tx: 0xSIM_...
```

**Key points:**
- `--min-rep` sets minimum own-reputation threshold (0.0 to 1.0)
- Agents start with ~0.35 score (identity verified + recency), so low thresholds pass immediately
- Optional `--min-price` and `--max-price` for price bounds
- Rejection is logged with specific reason
- Threshold is configurable per swap

---

### Demo 7: Coordinated Swaps

**What this shows**: Multi-agent coordination via propose/accept/execute protocol.

**In Agent A — propose a coordinated swap:**
```bash
propose 1 a2b 1 --min-rep 0.05
```

Expected output:
```
[PROPOSE] prop_XXXXX: 1 TKNA -> TKNB seeking 1 TKNB -> TKNA (min-rep: 0.05)
```

**Agent B sees:**
```
[PROPOSAL] prop_XXXXX: 1 TKNA -> TKNB seeking 1 TKNB -> TKNA (min-rep: 0.05)
  Type 'accept prop_XXXXX' to accept.
```

**In Agent B — accept:**
```bash
accept prop_XXXXX
```

**Check proposal status:**
```bash
proposals
```

Expected output:
```
Active proposals (1):
  prop_XXXXX | 1 TKNA -> TKNB -> seeking 1 TKNB -> TKNA | by 12D3KooW | accepted
```

**Key points:**
- Proposals have 60-second expiry with automatic cleanup
- `--min-rep` sets minimum reputation for counterparties
- Proposal lifecycle: Pending -> Accepted -> Filled (or Expired)
- Expired proposals penalize the initiator's reputation (-0.02)

---

### Demo 8: Trust Gating & Peer Scoring

**What this shows**: Unknown peers (those without verified identity) are blocked from coordination. Gossipsub scoring integrates with reputation.

Once Agent C connects and its identity attestation is verified, it starts at TrustLevel::Low (~0.35 score). Trust gating blocks `TrustLevel::Unknown` peers — those whose identity attestation has not yet been verified or who have accumulated enough penalties to drop to zero.

**To demonstrate trust gating**, you can set a high `--min-rep` threshold on proposals:

**Agent A proposes with high reputation gate:**
```bash
propose 1 a2b 1 --min-rep 0.5
```

**Agent C (fresh, score ~0.35) tries to accept:**
```bash
accept prop_XXXXX
```

**Agent C sees:**
```
[ACCEPT] Cannot accept: your reputation 0.35 < required 0.50
```

**Key points:**
- Proposals and acceptances from `TrustLevel::Unknown` peers are silently ignored
- Fresh peers with verified identity start at ~0.35 (Low trust), not Unknown
- `--min-rep` on proposals gates which peers can accept
- Gossipsub P4 penalizes peers sending invalid messages (weight: -10.0)
- P5 application score fed by composite reputation every 30 seconds
- P7 behaviour penalty for general misbehavior (weight: -1.0)
- Stale peers (inactive 7+ days) are automatically cleaned up

---

### Demo 9: Filecoin Archival

**What this shows**: Swap logs and identity attestations archived to Filecoin via sidecar.

**Terminal 3 — Start sidecar:**
```bash
cd sidecar
npm install && npm start
```

Expected output:
```
Filecoin archival sidecar listening on port 3001
```

**In Agent A — check log status:**
```bash
log-status
```

Expected output:
```
Log buffer: 2 entries
Sidecar:    http://localhost:3001
```

**Archive to Filecoin:**
```bash
archive
```

Expected output:
```
Archived 2 entries to Filecoin
PieceCID: bafyrei...
Retrieve: retrieve bafyrei...
Browser: http://localhost:3001/view/bafyrei...
```

**Retrieve from Filecoin:**
```bash
retrieve bafyrei...
```

**View in browser:**
Open `http://localhost:3001/view/bafyrei...` to see formatted JSON with swap logs and identity attestations.

**Key points:**
- Node.js sidecar wraps `@filoz/synapse-sdk` (Filecoin Calibration testnet)
- Logs swap executions and identity attestations
- PieceCID is the Filecoin content identifier for retrieval
- Browser view available at `/view/:pieceCid`
- Opt-in via `FILECOIN_PRIVATE_KEY` in sidecar `.env`

---

### Demo 10: Full End-to-End Flow

**What this shows**: Complete lifecycle from connection to trust-gated coordination.

**Step 1 — Connect & identify**
```bash
# Terminal 1
cd agent && cargo run -- --simulate

# Terminal 2 (use port from Terminal 1)
cd agent && cargo run -- --simulate /ip4/127.0.0.1/tcp/<PORT>
```

Both agents auto-exchange identity attestations.

```bash
who      # Show own PeerId + EOA
peers    # Show verified peers with trust levels
```

**Step 2 — Signal intent**
```bash
intent 5 a2b 0.95 1.05
```

**Step 3 — Execute swaps & build reputation**
```bash
swap 1
swap 1
swap 1
reputation    # Check scores — own score should be ~0.50 (Medium trust)
```

**Step 4 — Conditional swap**
```bash
cswap 2 a2b --min-rep 0.3
```

**Step 5 — Coordinated swap**
```bash
# Agent A
propose 1 a2b 1 --min-rep 0.05

# Agent B
accept prop_XXXXX

# Either agent
proposals
```

**Step 6 — Verify final state**
```bash
reputation    # Updated scores after all activity
peers         # Trust levels reflect swap history
```

---

## Recording Script

### Introduction (15 seconds)

"This is a complete demo of the libp2p Uniswap V4 swap agent project — showing P2P communication, on-chain swap coordination, identity binding, reputation scoring, and trust-aware multi-agent coordination. Everything from Cycles 1 through 3."

---

### Part 1: Foundation — Chat & Swaps (60 seconds)

"Starting two agents in simulation mode. No wallet or RPC needed — agents communicate over gossipsub."

**[Start both agents, show connection]**

"Chat works instantly. Now I'll execute a swap — notice the intent broadcasts first, then the swap result. This is the PendingSwap pattern ensuring peers see intentions before execution."

**[Execute swap 1, show intent then swap on Agent B]**

"The `who` command shows my PeerId linked to my Ethereum address via EIP-191 signing. This happens automatically on connection."

**[Run who, then peers]**

---

### Part 2: Intent Signaling (30 seconds)

"The intent command broadcasts swap intentions with optional price bounds. Other agents can react before execution."

**[Execute intent 10 a2b 1.0 1.5, show Agent B receiving it]**

"Every swap command also auto-broadcasts intent first — there's always a 500ms gap for peers to respond."

---

### Part 3: Reputation & Trust (60 seconds)

"Agents start with a score of about 0.35 from identity verification alone. After three swaps, Agent A builds to about 0.50 — Medium trust. The score is a composite of swap count, identity verification, follow-through rate, and recency."

**[Execute 3 swaps, run reputation on Agent B]**

"Conditional swaps gate execution on reputation. Watch — this swap gets rejected because the threshold isn't met."

**[Run cswap with high threshold, show rejection]**

"After building reputation, the same conditional swap succeeds."

**[Build rep, succeed]**

---

### Part 4: Coordination (60 seconds)

"Agent A proposes a coordinated swap with a reputation minimum. Agent B sees it and accepts."

**[Propose -> Accept -> Check proposals]**

"Now watch trust gating — a brand new Agent C tries to propose, but Agent A ignores it because Agent C has no reputation."

**[Show ignored proposal from untrusted peer]**

"Under the hood, gossipsub peer scoring integrates with our reputation. P5 application scores are fed every 30 seconds. P4 penalizes invalid messages. P7 handles misbehavior."

---

### Part 5: Archival (30 seconds)

"The Filecoin sidecar archives swap logs and identity proofs. The `archive` command flushes the buffer and returns a PieceCID for retrieval."

**[Run log-status, archive, retrieve]**

"This creates an immutable audit trail — foundation for dispute resolution and cross-session trust."

---

### Wrap-Up (15 seconds)

"To summarize: identity binding, three execution modes, swap intents with the PendingSwap pattern, composite reputation scoring, reputation-gated conditional execution, multi-agent coordination with trust gates, gossipsub peer scoring integration, and Filecoin archival. 109 tests, zero warnings. Ready for the ARIA proposal."

---

## Suggested Video Structure

| Segment | Duration | Content |
|---------|----------|---------|
| Intro | 15s | Project overview |
| Chat & Swaps | 60s | Sim mode, P2P chat, V1/V2 swaps, identity |
| Intent Signaling | 30s | PendingSwap pattern |
| Reputation & Trust | 60s | Scoring, conditional swaps |
| Coordination | 60s | Propose/accept, trust gating |
| Archival | 30s | Filecoin sidecar |
| Wrap-up | 15s | Summary + test count |
| **Total** | **~4.5 min** | |

---

## Troubleshooting

### "Publish error: InsufficientPeers"
Normal on startup. Gossipsub mesh takes a few seconds to form. Messages will flow after the first heartbeat.

### "error sending packet on iface address No route to host"
mDNS error on non-routable network interfaces. Harmless — agents still connect via TCP/QUIC.

### Proposal not showing on Agent B
- Check both agents are connected (`peers` should list the other)
- Trust gating may be blocking if Agent A has no reputation on Agent B's side
- Proposals expire after 60 seconds

### Reputation score is 0.00
- Peers without verified identity start at 0.00 (Unknown trust)
- Once identity is verified, agents start at ~0.35 (identity + recency)
- Execute swaps to increase score further

### Conditional swap always rejected
- The `cswap` command checks your **own** reputation score, not a peer's
- Check your current score with `reputation` — find your own PeerId entry
- Lower the `--min-rep` threshold or execute more swaps to build your score

### Archival fails with connection error
- Ensure sidecar is running: `cd sidecar && npm start`
- Check `log-status` for sidecar URL (default: `http://localhost:3001`)
- Sidecar needs `FILECOIN_PRIVATE_KEY` in its `.env`

### Agents don't discover each other
- Use explicit dialing: `cargo run -- --simulate /ip4/127.0.0.1/tcp/<PORT>`
- mDNS discovery can take a few seconds on some networks
- Check firewall settings if on separate machines

---

## Pre-Recording Checklist

- [ ] Agent builds successfully (`cargo build --release`)
- [ ] All 109 tests pass (`cargo test`)
- [ ] Sidecar has FILECOIN_PRIVATE_KEY (for Demo 9)
- [ ] Terminals arranged side by side (2-3 terminals)
- [ ] Font size increased (16-18pt)
- [ ] Screen recording software ready (OBS, QuickTime, Loom)
- [ ] Clear terminal history
- [ ] Background notifications disabled
