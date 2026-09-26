use std::sync::atomic::{AtomicU8, Ordering};
use std::sync::Arc;

/// The three execution modes the agent can operate in.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum ExecutionMode {
    /// Live mode: real swaps on Sepolia testnet.
    Live = 0,
    /// Simulation mode: fake tx hashes, no on-chain execution.
    Simulate = 1,
    /// Local mode: real swaps against a local Anvil node (Sepolia fork).
    Local = 2,
}

impl ExecutionMode {
    fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Simulate,
            2 => Self::Local,
            _ => Self::Live,
        }
    }

    pub fn label(&self) -> &'static str {
        match self {
            Self::Live => "LIVE (Sepolia)",
            Self::Simulate => "SIMULATION",
            Self::Local => "LOCAL (Anvil)",
        }
    }
}

/// Thread-safe execution mode flag.
///
/// Wraps an `Arc<AtomicU8>` so it can be shared across the async event loop
/// and changed at runtime via the `sim on|off|local` command.
#[derive(Clone, Debug)]
pub struct SimulationMode {
    mode: Arc<AtomicU8>,
}

impl SimulationMode {
    /// Create from CLI flags.
    /// - `simulate=false` => Live
    /// - `simulate=true, local=false` => Simulate
    /// - `simulate=true, local=true` => Local
    pub fn new(simulate: bool, local: bool) -> Self {
        let mode = if !simulate {
            ExecutionMode::Live
        } else if local {
            ExecutionMode::Local
        } else {
            ExecutionMode::Simulate
        };
        Self {
            mode: Arc::new(AtomicU8::new(mode as u8)),
        }
    }

    /// Returns the current execution mode.
    pub fn get(&self) -> ExecutionMode {
        ExecutionMode::from_u8(self.mode.load(Ordering::Relaxed))
    }

    /// Returns `true` if in Simulate mode (fake hashes, skip execution).
    /// Returns `false` for Local mode — Local should execute real swaps.
    pub fn is_active(&self) -> bool {
        self.get() == ExecutionMode::Simulate
    }

    /// Returns `true` if in Local (Anvil) mode.
    pub fn is_local(&self) -> bool {
        self.get() == ExecutionMode::Local
    }

    /// Set the execution mode directly.
    pub fn set_mode(&self, mode: ExecutionMode) {
        self.mode.store(mode as u8, Ordering::Relaxed);
    }

    /// Legacy setter — `set(true)` => Simulate, `set(false)` => Live.
    pub fn set(&self, active: bool) {
        let mode = if active {
            ExecutionMode::Simulate
        } else {
            ExecutionMode::Live
        };
        self.set_mode(mode);
    }
}

/// Generate a synthetic transaction hash for simulation mode.
///
/// Format: `0xSIM_{last8chars_of_peer_id}_{unix_timestamp_hex}`
pub fn simulated_tx_hash(peer_id: &str) -> String {
    let suffix = if peer_id.len() >= 8 {
        &peer_id[peer_id.len() - 8..]
    } else {
        peer_id
    };
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("0xSIM_{suffix}_{timestamp:x}")
}
