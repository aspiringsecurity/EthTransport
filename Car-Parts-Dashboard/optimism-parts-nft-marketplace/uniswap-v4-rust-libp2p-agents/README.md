# libp2p-v4-swap-agents

Rust libp2p agents coordinating Uniswap V4 swaps on Sepolia testnet with trust-aware networking primitives.

## Overview

This project demonstrates how decentralized P2P agents can coordinate on-chain DeFi operations using:
- **rust-libp2p** for peer-to-peer communication, gossipsub messaging, and peer scoring
- **Uniswap V4 Hooks** for on-chain swap tracking and dynamic fee rebates
- **Composite reputation scoring** with trust levels and misbehavior penalties
- **Multi-agent coordination** via propose/accept/execute protocols
- **Filecoin archival** for immutable swap log storage via Synapse SDK

Built as part of the PLDG Cohort 7 programme, exploring trust-aware networking primitives for libp2p.

## Architecture

```
                         libp2p Gossipsub Network
                    (v4-swap-agents + v4-swap-intents)

  ┌──────────────────────┐           ┌──────────────────────┐
  │      Agent A         │◄─────────►│      Agent B         │
  │                      │           │                      │
  │  ┌────────────────┐  │  Identity │  ┌────────────────┐  │
  │  │ Identity       │  │  Binding  │  │ Identity       │  │
  │  │ (EIP-191)      │◄─┼──────────┼─►│ (EIP-191)      │  │
  │  ├────────────────┤  │           │  ├────────────────┤  │
  │  │ Reputation     │  │  Intents  │  │ Reputation     │  │
  │  │ Store          │◄─┼──────────┼─►│ Store          │  │
  │  ├────────────────┤  │           │  ├────────────────┤  │
  │  │ Coordination   │  │ Proposals │  │ Coordination   │  │
  │  │ Book           │◄─┼──────────┼─►│ Book           │  │
  │  ├────────────────┤  │           │  ├────────────────┤  │
  │  │ Peer Scoring   │  │  Scoring  │  │ Peer Scoring   │  │
  │  │ (P4/P5/P7)     │◄─┼──────────┼─►│ (P4/P5/P7)     │  │
  │  └────────────────┘  │           │  └────────────────┘  │
  └──────────┬───────────┘           └──────────┬───────────┘
             │                                  │
             │         Swap Execution           │
             ▼                                  ▼
  ┌─────────────────────────────────────────────────────────┐
  │              Uniswap V4 PoolManager (Sepolia)           │
  │  ┌───────────────────┐  ┌───────────────────────────┐   │
  │  │ AgentCounter (V1) │  │ AgentCounterV2            │   │
  │  │ - Swap tracking   │  │ - hookData agent tracking │   │
  │  │ - Event emission  │  │ - Dynamic fee rebates     │   │
  │  └───────────────────┘  └───────────────────────────┘   │
  └─────────────────────────────────────────────────────────┘
             │
             ▼
  ┌─────────────────────┐
  │ Filecoin (Calibra.) │  Archival via Synapse SDK sidecar
  │ - Swap logs         │
  │ - Identity proofs   │
  └─────────────────────┘
```

## Features

### Execution Modes
- **Live (Sepolia)** — Real on-chain transactions
- **Simulation** (`--simulate`) — Synthetic tx hashes, no `.env` needed
- **Local Anvil** (`--simulate --local`) — Real swaps against local fork, zero cost
- Runtime toggle: `sim on/off/local`

### Swap Intent Gossip
- Dedicated gossipsub topic (`v4-swap-intents`) for pre-trade coordination
- `intent` command broadcasts amount, direction, and optional price bounds
- **PendingSwap pattern**: intent broadcast -> 500ms swarm flush -> swap execution
- Peers see `[INTENT]` before `[SWAP]`, enabling counter-swaps and coordination

### Identity Binding (PeerId <-> EOA)
- EIP-191 `personal_sign` links libp2p PeerId to Ethereum address
- Attestations auto-exchanged on peer connection via gossipsub
- Signature verification prevents Sybil attacks
- `who` and `peers` commands for identity inspection

### Reputation Scoring
- **Composite score** with 4 weighted factors:
  - Swap count (40%) — successful swap history
  - Identity verified (20%) — PeerId <-> EOA binding
  - Follow-through rate (25%) — intent-to-execution ratio
  - Recency (15%) — 24-hour half-life decay
- **Trust levels**: Unknown, Low, Medium, High, Trusted
- **Misbehavior penalties**: invalid messages (-0.05), unfollowed intents (-0.03), expired proposals (-0.02), capped at 0.5

### Conditional Swaps
- Reputation-gated swap execution with `cswap` command
- Set minimum reputation threshold for counterparty
- Optional price bounds (min/max)
- Automatic rejection with reason logging

### Coordinated Swaps
- **Propose/Accept/Execute** protocol for multi-agent coordination
- Proposals carry minimum reputation threshold for counterparties
- 60-second expiry with automatic cleanup
- Trust-gated: proposals from Unknown peers are silently ignored

### Gossipsub Peer Scoring
- **P4** — Invalid message deliveries penalty (weight: -10.0)
- **P5** — Application-specific score fed by composite reputation
- **P7** — Behaviour penalty for general misbehavior (weight: -1.0)
- Message validation (Accept/Reject) via `validate_messages()`
- 30-second periodic score refresh cycle
- 7-day stale peer cleanup

### Filecoin Archival
- Node.js sidecar wrapping `@filoz/synapse-sdk` (Calibration testnet)
- Archives swap logs and identity attestations to Filecoin
- CLI retrieval (`retrieve`) and browser view (`/view/:pieceCid`)

## Project Structure

```
libp2p-v4-swap-agents/
├── contracts/                 # Foundry - Uniswap V4 Hooks
│   ├── src/
│   │   ├── AgentCounter.sol   # V1 hook (swap tracking, events)
│   │   └── AgentCounterV2.sol # V2 hook (dynamic fees, hookData agent tracking)
│   ├── script/                # Deployment scripts (salt mining, pool creation)
│   │   ├── base/              # Shared config (BaseScript, LiquidityHelpers)
│   │   ├── MineSalt.s.sol / MineSaltV2.s.sol
│   │   ├── DeployWithSalt.s.sol / DeployWithSaltV2.s.sol
│   │   ├── DeployTokens.s.sol
│   │   ├── 01_CreatePoolAndAddLiquidity.s.sol / V2
│   │   └── 02_Swap.s.sol / 02_SwapV2.s.sol
│   └── test/                  # Solidity tests (10 passing)
│       ├── AgentCounter.t.sol
│       └── AgentCounterV2.t.sol
├── agent/                     # Rust libp2p agent
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs            # Event loop, CLI commands, message handling
│       ├── cli.rs             # clap CLI parser (--simulate, --local, dial)
│       ├── sim.rs             # ExecutionMode enum, synthetic tx hashes
│       ├── network.rs         # Gossipsub + mDNS behaviour, peer scoring params
│       ├── uniswap.rs         # On-chain swap client (Alloy)
│       ├── identity.rs        # PeerId <-> EOA identity binding (EIP-191)
│       ├── reputation.rs      # Composite scoring, trust levels, penalties
│       ├── coordination.rs    # Multi-agent swap coordination protocol
│       ├── archival.rs        # LogEntry, LogArchiver, Filecoin archival
│       └── tests/             # Unit tests (109 passing)
│           ├── network.rs     # Gossipsub, topics, peer scoring tests
│           ├── identity.rs    # EIP-191 attestation tests
│           ├── sim.rs         # Simulation mode tests
│           ├── archival.rs    # Log archiver tests
│           ├── reputation.rs  # Scoring, penalties, trust level tests
│           └── coordination.rs # Proposal lifecycle tests
├── sidecar/                   # Node.js Synapse SDK sidecar
│   ├── index.js               # Express server: /upload, /retrieve, /view
│   ├── package.json
│   └── .env.example
├── docs/                      # Project documentation
├── documentation/             # Demo guides, technical writeup
└── README.md
```

## Quick Start

### Simulation Mode (no `.env` needed)

```bash
# Terminal 1 — Agent A
cd agent && cargo run -- --simulate

# Terminal 2 — Agent B (use TCP port from Agent A's output)
cd agent && cargo run -- --simulate /ip4/127.0.0.1/tcp/<PORT>
```

### Live Mode (Sepolia)

```bash
# Set up environment
cp .env.example .env
# Edit .env with SEPOLIA_RPC_URL and PRIVATE_KEY

# Terminal 1
cd agent && cargo run

# Terminal 2
cd agent && cargo run -- /ip4/127.0.0.1/tcp/<PORT>
```

### Local Anvil Mode (real swaps, zero cost)

```bash
# Terminal 1 — Start Anvil fork
anvil --fork-url $SEPOLIA_RPC_URL

# Terminal 2 — Agent
SEPOLIA_RPC_URL=http://localhost:8545 PRIVATE_KEY=$PRIVATE_KEY \
  cargo run -- --simulate --local
```

## Commands

| Command | Description |
|---------|-------------|
| `swap <amount>` | Swap TKNA -> TKNB (V1 pool) |
| `swap-b <amount>` | Swap TKNB -> TKNA (V1 pool) |
| `swap-v2 <amount>` | Swap TKNA -> TKNB (V2 pool, fee rebates) |
| `swap-v2-b <amount>` | Swap TKNB -> TKNA (V2 pool, fee rebates) |
| `cswap <amount> <a2b\|b2a> [options]` | Conditional swap (reputation-gated) |
| `intent <amount> <a2b\|b2a> [min] [max]` | Broadcast swap intent with optional price bounds |
| `propose <amt> <a2b\|b2a> <desired_amt> [--min-rep <score>]` | Propose coordinated swap |
| `accept <proposal-id>` | Accept a peer's swap proposal |
| `proposals` | List active swap proposals |
| `reputation [peer]` | Show peer reputation scores and trust levels |
| `status` | Query V1 on-chain swap counts |
| `status-v2` | Query V2 swap counts + your fee tier |
| `sim on\|off\|local` | Set execution mode |
| `archive` | Flush log buffer to Filecoin via sidecar |
| `retrieve <pieceCid>` | Retrieve archived data from Filecoin |
| `log-status` | Show log buffer count and sidecar URL |
| `who` | Show your PeerId and linked EOA |
| `peers` | List all verified peer identities + trust |
| `dial <multiaddr>` | Connect to a peer manually |
| `help` | Show available commands |
| `<text>` | Send chat message to peers |

## Contracts

### AgentCounter Hook (V1)

A Uniswap V4 hook that tracks swap activity per agent address:

- **beforeSwap / afterSwap** — Increments counters on each swap
- **agentSwapCount** — Tracks swaps per agent address
- **AgentSwap event** — Emitted for off-chain tracking by libp2p agents

### AgentCounterV2 Hook

An upgraded hook that fixes V1's agent tracking bug and adds dynamic fee rebates:

- **hookData agent tracking** — Decodes the real agent EOA from hookData (V1 incorrectly tracked the router address)
- **Dynamic fee rebates** — Frequent agents (5+ swaps) pay 0.20% instead of the 0.30% base fee
- **DYNAMIC_FEE_FLAG pool** — Uses Uniswap V4's fee override mechanism via `_beforeSwap`

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| AgentCounter Hook (V1) | [`0x5D4505AA950a73379B8E9f1116976783Ba8340C0`](https://sepolia.etherscan.io/address/0x5D4505AA950a73379B8E9f1116976783Ba8340C0) |
| AgentCounterV2 Hook | [`0xA8760B755c67c5C75A8A60ED7E3713eA2448D0C0`](https://sepolia.etherscan.io/address/0xA8760B755c67c5C75A8A60ED7E3713eA2448D0C0) |
| Token A (TKNA) | [`0x7546360e0011Bb0B52ce10E21eF0E9341453fE71`](https://sepolia.etherscan.io/address/0x7546360e0011Bb0B52ce10E21eF0E9341453fE71) |
| Token B (TKNB) | [`0xF6d91478e66CE8161e15Da103003F3BA6d2bab80`](https://sepolia.etherscan.io/address/0xF6d91478e66CE8161e15Da103003F3BA6d2bab80) |

### Uniswap V4 Infrastructure (Sepolia)

| Contract | Address |
|----------|---------|
| PoolManager | [`0xE03A1074c86CFeDd5C142C4F04F1a1536e203543`](https://sepolia.etherscan.io/address/0xE03A1074c86CFeDd5C142C4F04F1a1536e203543) |
| PositionManager | [`0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4`](https://sepolia.etherscan.io/address/0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4) |
| SwapRouter | [`0xf13D190e9117920c703d79B5F33732e10049b115`](https://sepolia.etherscan.io/address/0xf13D190e9117920c703d79B5F33732e10049b115) |

## Development

### Prerequisites

- [Rust](https://rustup.rs/) (1.75+)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+ (for Filecoin sidecar)

### Build & Test

```bash
# Rust agent
cd agent
cargo build
cargo test          # 109 tests
cargo clippy        # Zero warnings

# Solidity contracts
cd contracts
forge build
forge test          # 10 tests
```

### Filecoin Sidecar

```bash
cd sidecar
cp .env.example .env  # Add FILECOIN_PRIVATE_KEY
npm install && npm start
```

## Roadmap

- [x] AgentCounter hook contract (V1) — swap tracking, events
- [x] AgentCounterV2 — dynamic fee rebates, hookData agent tracking
- [x] Deployment to Sepolia with TxID verification
- [x] Rust libp2p agent — P2P chat, swap execution
- [x] PeerId <-> EOA identity binding (EIP-191)
- [x] Simulation mode (3 execution modes)
- [x] Swap intent gossip (PendingSwap pattern)
- [x] Filecoin log archival (Synapse SDK sidecar)
- [x] Composite reputation scoring with trust levels
- [x] Conditional swaps (reputation-gated)
- [x] Multi-agent coordinated swaps (propose/accept/execute)
- [x] Gossipsub peer scoring (P4/P5/P7)
- [x] Misbehavior penalties and trust-based peer gating
- [ ] libp2p request-response for quotes
- [ ] MEV-aware agent coordination
- [ ] Cross-chain intent propagation
- [ ] Delegated execution (solver/relayer pattern)

## Test Coverage

109 Rust tests + 10 Solidity tests across all modules:

| Module | Tests |
|--------|-------|
| Reputation (scoring, penalties, trust) | 34 |
| Network (gossipsub, topics, P4/P5/P7) | 18 |
| Coordination (proposals, lifecycle) | 10 |
| Identity (EIP-191, registry) | 6 |
| Simulation (modes, tx hashes) | 9 |
| Archival (log entries, buffer) | 8 |
| Uniswap (pool keys, V1/V2) | 24 |
| Solidity (AgentCounter V1 + V2) | 10 |

## License

MIT
