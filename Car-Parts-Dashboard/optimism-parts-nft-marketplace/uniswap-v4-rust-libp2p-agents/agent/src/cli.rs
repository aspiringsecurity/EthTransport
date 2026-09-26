use clap::Parser;

/// libp2p Uniswap V4 Swap Agent
#[derive(Parser, Debug)]
#[command(name = "libp2p-swap-agent")]
#[command(about = "P2P agent for coordinating Uniswap V4 swaps")]
pub struct Cli {
    /// Run in simulation mode (no on-chain transactions, env vars optional)
    #[arg(short, long)]
    pub simulate: bool,

    /// Execute real swaps against a local Anvil node (requires --simulate).
    /// Start Anvil first: `anvil --fork-url $SEPOLIA_RPC_URL`
    #[arg(long, requires = "simulate")]
    pub local: bool,

    /// Multiaddr of a remote peer to dial on startup
    #[arg(value_name = "MULTIADDR")]
    pub dial: Option<String>,
}
