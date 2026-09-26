use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use alloy::primitives::U256;

/// Default max slippage: 50 basis points (0.5%).
pub const DEFAULT_MAX_SLIPPAGE_BPS: u64 = 50;

/// Sandwich detection threshold: 200 bps (2%).
///
/// If realized slippage exceeds this after a successful swap, the execution
/// environment was likely adversarial (sandwich attack or extreme price impact).
pub const SANDWICH_THRESHOLD_BPS: u64 = 200;

/// Per-agent MEV configuration. Governs slippage enforcement on all outgoing swaps.
#[derive(Debug, Clone)]
pub struct MevConfig {
    /// Maximum acceptable slippage in basis points (100 bps = 1%).
    /// Enforced on-chain via `amountOutMin`.
    pub max_slippage_bps: u64,
}

impl Default for MevConfig {
    fn default() -> Self {
        Self {
            max_slippage_bps: DEFAULT_MAX_SLIPPAGE_BPS,
        }
    }
}

/// Record of a single swap's MEV outcome.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct MevEvent {
    /// Swap direction label (e.g. "TKNA -> TKNB").
    pub direction: String,
    /// Input token amount in wei.
    pub amount_in: U256,
    /// Minimum output enforced on-chain (amountOutMin passed to router).
    pub amount_out_min: U256,
    /// Actual output received (measured via balance diff).
    pub actual_out: U256,
    /// Realized slippage vs expected 1:1 output, in basis points.
    pub realized_slippage_bps: u64,
    /// True if `realized_slippage_bps` exceeded `SANDWICH_THRESHOLD_BPS`.
    pub sandwich_detected: bool,
    pub timestamp: u64,
}

/// Aggregated MEV statistics for a remote peer (built from received `MevAlert` messages).
#[derive(Debug, Clone, Default)]
pub struct PeerMevStats {
    /// Total MevAlert messages received from this peer.
    pub alerts_received: u64,
    /// How many flagged a sandwich.
    pub sandwich_count: u64,
    /// Cumulative realized slippage across all alerts (in bps).
    pub total_slippage_bps: u64,
}

impl PeerMevStats {
    pub fn avg_slippage_bps(&self) -> u64 {
        if self.alerts_received == 0 {
            0
        } else {
            self.total_slippage_bps / self.alerts_received
        }
    }
}

/// Thread-safe store for own MEV events and remote peer alert history.
pub struct MevStore {
    own_events: Arc<Mutex<Vec<MevEvent>>>,
    peer_stats: Arc<Mutex<HashMap<String, PeerMevStats>>>,
    config: Arc<Mutex<MevConfig>>,
}

impl MevStore {
    pub fn new() -> Self {
        Self {
            own_events: Arc::new(Mutex::new(Vec::new())),
            peer_stats: Arc::new(Mutex::new(HashMap::new())),
            config: Arc::new(Mutex::new(MevConfig::default())),
        }
    }

    pub fn max_slippage_bps(&self) -> u64 {
        self.config.lock().unwrap().max_slippage_bps
    }

    pub fn set_max_slippage_bps(&self, bps: u64) {
        self.config.lock().unwrap().max_slippage_bps = bps;
    }

    pub fn record_event(&self, event: MevEvent) {
        self.own_events.lock().unwrap().push(event);
    }

    pub fn record_peer_alert(&self, peer_id: &str, slippage_bps: u64, sandwich_detected: bool) {
        let mut stats = self.peer_stats.lock().unwrap();
        let entry = stats.entry(peer_id.to_string()).or_default();
        entry.alerts_received += 1;
        entry.total_slippage_bps += slippage_bps;
        if sandwich_detected {
            entry.sandwich_count += 1;
        }
    }

    /// Summary of our own swap MEV outcomes.
    pub fn own_summary(&self) -> MevSummary {
        let events = self.own_events.lock().unwrap();
        let total = events.len() as u64;
        let sandwiches = events.iter().filter(|e| e.sandwich_detected).count() as u64;
        let total_slip: u64 = events.iter().map(|e| e.realized_slippage_bps).sum();
        let worst = events.iter().map(|e| e.realized_slippage_bps).max().unwrap_or(0);
        MevSummary {
            total_swaps: total,
            sandwich_count: sandwiches,
            avg_slippage_bps: if total > 0 { total_slip / total } else { 0 },
            worst_slippage_bps: worst,
        }
    }

    pub fn peer_stats_all(&self) -> HashMap<String, PeerMevStats> {
        self.peer_stats.lock().unwrap().clone()
    }
}

/// Summary of our own MEV outcomes across all swaps.
#[derive(Debug, Clone)]
pub struct MevSummary {
    pub total_swaps: u64,
    pub sandwich_count: u64,
    pub avg_slippage_bps: u64,
    pub worst_slippage_bps: u64,
}

/// Compute `amountOutMin` for on-chain slippage enforcement.
///
/// For a 1:1 pool, `amount_in` ≈ `amount_out` before fees and price impact.
/// This sets the floor the router must meet or the transaction reverts.
///
/// Example: 100 tokens in, 50 bps → amountOutMin = 99.5 tokens (in wei).
pub fn compute_amount_out_min(amount_in: U256, slippage_bps: u64) -> U256 {
    let clamped = slippage_bps.min(9_999);
    let numerator = amount_in * U256::from(10_000u64 - clamped);
    numerator / U256::from(10_000u64)
}

/// Compute realized slippage in bps relative to expected 1:1 output.
///
/// `expected_out` is `amount_in` for this pool (1:1 price baseline).
/// Returns 0 if actual_out >= expected_out (no slippage or favorable fill).
pub fn compute_realized_slippage_bps(expected_out: U256, actual_out: U256) -> u64 {
    if expected_out.is_zero() || actual_out >= expected_out {
        return 0;
    }
    let shortfall = expected_out - actual_out;
    (shortfall * U256::from(10_000u64) / expected_out).saturating_to::<u64>()
}

/// Returns `true` if realized slippage exceeds `SANDWICH_THRESHOLD_BPS`.
pub fn is_sandwich(expected_out: U256, actual_out: U256) -> bool {
    compute_realized_slippage_bps(expected_out, actual_out) > SANDWICH_THRESHOLD_BPS
}
