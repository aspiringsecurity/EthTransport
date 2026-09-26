# libp2p Uniswap V4 Swap Agent

A Rust peer-to-peer agent that uses libp2p for communication and Alloy for executing Uniswap V4 swaps on Sepolia testnet.

## How It Works

Agents discover each other via **mDNS** (local network) or manual **dial** and communicate over **gossipsub**. Any agent can execute on-chain swaps against the deployed AgentCounter hook, which tracks swap counts per agent. Swap results are broadcast to all connected peers.

```
Agent A                          Agent B
  │                                │
  │──── gossipsub (chat/swap) ────►│
  │                                │
  ├── swap 1 ──► Sepolia ──────────┤
  │              (AgentCounter)    │
  │◄── [SWAP] broadcast ──────────┤
```

## Prerequisites

- [Rust](https://rustup.rs/)
- A `.env` file in the project root with:
  ```
  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
  PRIVATE_KEY=your_private_key_here
  ```
- Wallet funded with Sepolia ETH and TKNA/TKNB tokens

## Usage

### Start the first agent

```bash
cargo run
```

Note the TCP listening address in the output, e.g. `Listening on /ip4/127.0.0.1/tcp/54321`.

### Start the second agent

```bash
cargo run -- /ip4/127.0.0.1/tcp/54321
```

Wait for `Connected to peer: ...` to appear in both terminals.

### Commands

| Command | Description |
|---------|-------------|
| `swap <amount>` | Swap TKNA -> TKNB, broadcast result to peers |
| `swap-b <amount>` | Swap TKNB -> TKNA, broadcast result to peers |
| `status` | Query AgentCounter hook for on-chain swap counts |
| `dial <multiaddr>` | Connect to a peer (e.g. `/ip4/127.0.0.1/tcp/PORT`) |
| `help` | Show available commands |
| `<text>` | Send a chat message to all connected peers |

## Architecture

### `src/network.rs`

- **`AgentBehaviour`** — combines gossipsub (pub/sub messaging) and mDNS (peer discovery)
- **`AgentMessage`** — enum for Chat, SwapExecuted, and SwapRequest messages, serialized as JSON over gossipsub
- **`build_swarm()`** — creates the libp2p swarm with TCP + QUIC transports, noise encryption, yamux multiplexing

### `src/uniswap.rs`

- **`SwapClient`** — handles on-chain interaction via Alloy
  - `execute_swap(amount, zero_for_one)` — approves tokens + calls SwapRouter
  - `get_swap_counts()` — queries AgentCounter hook for pool and agent swap counts

### `src/main.rs`

- Tokio event loop with `select!` over stdin (user commands) and swarm events (peer messages)
- Parses CLI commands, triggers swaps, broadcasts results
- Handles mDNS discovery/expiry and gossipsub message display

## Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| AgentCounter Hook | [`0x5D4505AA950a73379B8E9f1116976783Ba8340C0`](https://sepolia.etherscan.io/address/0x5D4505AA950a73379B8E9f1116976783Ba8340C0) |
| Token A (TKNA) | [`0x7546360e0011Bb0B52ce10E21eF0E9341453fE71`](https://sepolia.etherscan.io/address/0x7546360e0011Bb0B52ce10E21eF0E9341453fE71) |
| Token B (TKNB) | [`0xF6d91478e66CE8161e15Da103003F3BA6d2bab80`](https://sepolia.etherscan.io/address/0xF6d91478e66CE8161e15Da103003F3BA6d2bab80) |
| SwapRouter | [`0xf13D190e9117920c703d79B5F33732e10049b115`](https://sepolia.etherscan.io/address/0xf13D190e9117920c703d79B5F33732e10049b115) |

## Dependencies

- **libp2p** — gossipsub, mDNS, TCP, QUIC, noise, yamux
- **alloy** — Ethereum provider, signer, sol! macro for contract interaction
- **tokio** — async runtime
- **serde / serde_json** — message serialization
- **dotenvy** — .env file loading
