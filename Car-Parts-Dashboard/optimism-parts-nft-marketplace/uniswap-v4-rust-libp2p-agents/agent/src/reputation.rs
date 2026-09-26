use std::collections::HashMap;
use std::fmt;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

/// Weights for each reputation factor. Sum to 1.0.
pub const WEIGHT_SWAP_COUNT: f64 = 0.40;
pub const WEIGHT_IDENTITY: f64 = 0.20;
pub const WEIGHT_FOLLOW_THROUGH: f64 = 0.25;
pub const WEIGHT_RECENCY: f64 = 0.15;

/// Maximum raw swap count for normalization (score saturates here).
pub const MAX_SWAP_COUNT: f64 = 50.0;

/// Half-life for recency decay in seconds (24 hours).
pub const RECENCY_HALF_LIFE: f64 = 86400.0;

/// Maximum total penalty deduction from misbehavior.
pub const MAX_PENALTY: f64 = 0.5;

/// Penalty per invalid/malformed message received from a peer.
pub const PENALTY_INVALID_MESSAGE: f64 = 0.05;

/// Penalty per intent not followed through with a swap.
pub const PENALTY_UNFOLLOWED_INTENT: f64 = 0.03;

/// Penalty per expired proposal (created but never executed).
pub const PENALTY_EXPIRED_PROPOSAL: f64 = 0.02;

/// Peers inactive longer than this (7 days) are eligible for cleanup.
pub const STALE_PEER_THRESHOLD: u64 = 7 * 86400;

/// Per-peer reputation data, derived from gossipsub messages.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerReputation {
    pub peer_id: String,
    /// Count of SwapExecuted messages seen from this peer.
    pub swap_count: u64,
    /// Count of SwapIntent messages seen from this peer.
    pub intent_count: u64,
    /// Whether peer has a verified identity in PeerRegistry.
    pub identity_verified: bool,
    /// Unix timestamp of last observed activity (swap or intent).
    pub last_active: u64,
    /// Count of invalid/malformed messages received from this peer.
    #[serde(default)]
    pub invalid_message_count: u64,
    /// Count of intents not followed through with a swap.
    #[serde(default)]
    pub unfollowed_intent_count: u64,
    /// Count of expired proposals initiated by this peer.
    #[serde(default)]
    pub expired_proposal_count: u64,
}

impl PeerReputation {
    pub fn new(peer_id: String) -> Self {
        Self {
            peer_id,
            swap_count: 0,
            intent_count: 0,
            identity_verified: false,
            last_active: 0,
            invalid_message_count: 0,
            unfollowed_intent_count: 0,
            expired_proposal_count: 0,
        }
    }

    /// Compute total penalty deduction from misbehavior. Capped at MAX_PENALTY.
    pub fn penalty_score(&self) -> f64 {
        let raw = (self.invalid_message_count as f64 * PENALTY_INVALID_MESSAGE)
            + (self.unfollowed_intent_count as f64 * PENALTY_UNFOLLOWED_INTENT)
            + (self.expired_proposal_count as f64 * PENALTY_EXPIRED_PROPOSAL);
        raw.min(MAX_PENALTY)
    }

    /// Compute normalized composite score in [0.0, 1.0].
    /// Penalties are subtracted from the base score, clamped to 0.0.
    pub fn composite_score(&self) -> f64 {
        let swap_score = (self.swap_count as f64 / MAX_SWAP_COUNT).min(1.0);
        let identity_score = if self.identity_verified { 1.0 } else { 0.0 };
        let follow_through = if self.intent_count == 0 && self.swap_count == 0 {
            0.0 // no activity = no credit
        } else if self.intent_count == 0 {
            1.0 // swaps without intents = full credit
        } else {
            (self.swap_count as f64 / self.intent_count as f64).min(1.0)
        };
        let recency = self.recency_score();

        let base = WEIGHT_SWAP_COUNT * swap_score
            + WEIGHT_IDENTITY * identity_score
            + WEIGHT_FOLLOW_THROUGH * follow_through
            + WEIGHT_RECENCY * recency;

        (base - self.penalty_score()).max(0.0)
    }

    /// Exponential decay based on time since last activity.
    /// Returns 1.0 if active now, decays with 24-hour half-life.
    pub fn recency_score(&self) -> f64 {
        if self.last_active == 0 {
            return 0.0;
        }
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let elapsed = now.saturating_sub(self.last_active) as f64;
        (-elapsed * 2.0_f64.ln() / RECENCY_HALF_LIFE).exp()
    }

    /// Compute recency score relative to a specific reference timestamp.
    /// Used for deterministic testing.
    #[cfg(test)]
    pub fn recency_score_at(&self, now_secs: u64) -> f64 {
        if self.last_active == 0 {
            return 0.0;
        }
        let elapsed = now_secs.saturating_sub(self.last_active) as f64;
        (-elapsed * 2.0_f64.ln() / RECENCY_HALF_LIFE).exp()
    }

    pub fn trust_level(&self) -> TrustLevel {
        let score = self.composite_score();
        TrustLevel::from_score(score)
    }
}

/// Trust tier derived from the composite score.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TrustLevel {
    Unknown,
    Low,
    Medium,
    High,
    Trusted,
}

impl TrustLevel {
    pub fn from_score(score: f64) -> Self {
        match score {
            s if s <= 0.0 => TrustLevel::Unknown,
            s if s <= 0.3 => TrustLevel::Low,
            s if s <= 0.6 => TrustLevel::Medium,
            s if s <= 0.85 => TrustLevel::High,
            _ => TrustLevel::Trusted,
        }
    }
}

impl fmt::Display for TrustLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TrustLevel::Unknown => write!(f, "Unknown"),
            TrustLevel::Low => write!(f, "Low"),
            TrustLevel::Medium => write!(f, "Medium"),
            TrustLevel::High => write!(f, "High"),
            TrustLevel::Trusted => write!(f, "Trusted"),
        }
    }
}

/// Conditions that must be met before a conditional swap executes.
#[derive(Debug, Clone, Default)]
pub struct SwapConditions {
    /// Minimum reputation score required (0.0-1.0).
    pub min_reputation: Option<f64>,
    /// Price lower bound (informational, broadcast in intent).
    pub min_price: Option<String>,
    /// Price upper bound (informational, broadcast in intent).
    pub max_price: Option<String>,
}

impl SwapConditions {
    pub fn is_empty(&self) -> bool {
        self.min_reputation.is_none() && self.min_price.is_none() && self.max_price.is_none()
    }

    /// Evaluate conditions against current state.
    pub fn evaluate(
        &self,
        own_peer_id: &str,
        reputation_store: &ReputationStore,
    ) -> ConditionResult {
        if let Some(min_rep) = self.min_reputation {
            let own_score = reputation_store.score(own_peer_id);
            if own_score < min_rep {
                return ConditionResult::Failed(format!(
                    "Reputation too low: {:.2} < {:.2} threshold",
                    own_score, min_rep
                ));
            }
        }

        if let Some(ref min_p) = self.min_price {
            if min_p.parse::<f64>().is_err() {
                return ConditionResult::Failed(format!("Invalid min_price: {min_p}"));
            }
        }
        if let Some(ref max_p) = self.max_price {
            if max_p.parse::<f64>().is_err() {
                return ConditionResult::Failed(format!("Invalid max_price: {max_p}"));
            }
        }

        ConditionResult::Passed
    }
}

/// Result of condition evaluation.
#[derive(Debug, Clone)]
pub enum ConditionResult {
    Passed,
    Failed(String),
}

impl ConditionResult {
    #[cfg(test)]
    pub fn is_passed(&self) -> bool {
        matches!(self, ConditionResult::Passed)
    }
}

/// Thread-safe reputation store, mirrors the Arc<Mutex<_>> pattern
/// used by LogArchiver in archival.rs.
#[derive(Clone, Debug)]
pub struct ReputationStore {
    peers: Arc<Mutex<HashMap<String, PeerReputation>>>,
}

impl ReputationStore {
    pub fn new() -> Self {
        Self {
            peers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }

    /// Record a SwapExecuted event for a peer.
    pub fn record_swap(&self, peer_id: &str) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.swap_count += 1;
        rep.last_active = Self::now_secs();
    }

    /// Record a SwapIntent event for a peer.
    pub fn record_intent(&self, peer_id: &str) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.intent_count += 1;
        rep.last_active = Self::now_secs();
    }

    /// Update identity verification status for a peer.
    pub fn set_identity_verified(&self, peer_id: &str, verified: bool) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.identity_verified = verified;
        if verified {
            rep.last_active = Self::now_secs();
        }
    }

    /// Record an invalid/malformed message from a peer.
    pub fn record_invalid_message(&self, peer_id: &str) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.invalid_message_count += 1;
    }

    /// Record an unfollowed intent (intent without subsequent swap).
    /// Reserved for future intent follow-through tracking with time-window logic.
    #[allow(dead_code)]
    pub fn record_unfollowed_intent(&self, peer_id: &str) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.unfollowed_intent_count += 1;
    }

    /// Record an expired proposal for a peer.
    pub fn record_expired_proposal(&self, peer_id: &str) {
        let mut peers = self.peers.lock().unwrap();
        let rep = peers
            .entry(peer_id.to_string())
            .or_insert_with(|| PeerReputation::new(peer_id.to_string()));
        rep.expired_proposal_count += 1;
    }

    /// Remove peers that have been inactive for longer than STALE_PEER_THRESHOLD.
    /// Returns the number of peers removed.
    pub fn cleanup_stale_peers(&self) -> usize {
        let now = Self::now_secs();
        let mut peers = self.peers.lock().unwrap();
        let stale: Vec<String> = peers
            .iter()
            .filter(|(_, rep)| {
                rep.last_active > 0 && now.saturating_sub(rep.last_active) > STALE_PEER_THRESHOLD
            })
            .map(|(id, _)| id.clone())
            .collect();
        let count = stale.len();
        for id in stale {
            peers.remove(&id);
        }
        count
    }

    /// Get all peer scores for periodic P5 refresh.
    pub fn all_scores(&self) -> Vec<(String, f64)> {
        self.peers
            .lock()
            .unwrap()
            .iter()
            .map(|(id, rep)| (id.clone(), rep.composite_score()))
            .collect()
    }

    /// Get the reputation for a specific peer.
    #[cfg(test)]
    pub fn get(&self, peer_id: &str) -> Option<PeerReputation> {
        self.peers.lock().unwrap().get(peer_id).cloned()
    }

    /// Get all peer reputations.
    pub fn all(&self) -> HashMap<String, PeerReputation> {
        self.peers.lock().unwrap().clone()
    }

    /// Get composite score for a peer (0.0 if unknown).
    pub fn score(&self, peer_id: &str) -> f64 {
        self.peers
            .lock()
            .unwrap()
            .get(peer_id)
            .map(|r| r.composite_score())
            .unwrap_or(0.0)
    }

    /// Get trust level for a peer.
    pub fn trust_level(&self, peer_id: &str) -> TrustLevel {
        self.peers
            .lock()
            .unwrap()
            .get(peer_id)
            .map(|r| r.trust_level())
            .unwrap_or(TrustLevel::Unknown)
    }

    /// Display-formatted reputation summary for a peer.
    pub fn summary(&self, peer_id: &str) -> String {
        let peers = self.peers.lock().unwrap();
        match peers.get(peer_id) {
            Some(rep) => {
                let score = rep.composite_score();
                let level = rep.trust_level();
                let follow = if rep.intent_count > 0 {
                    format!(
                        "{:.0}%",
                        (rep.swap_count as f64 / rep.intent_count as f64).min(1.0) * 100.0
                    )
                } else {
                    "n/a".to_string()
                };
                let penalty_str = if rep.invalid_message_count > 0
                    || rep.unfollowed_intent_count > 0
                    || rep.expired_proposal_count > 0
                {
                    format!(
                        " | Penalties: -{:.2} (invalid={}, unfollowed={}, expired={})",
                        rep.penalty_score(),
                        rep.invalid_message_count,
                        rep.unfollowed_intent_count,
                        rep.expired_proposal_count
                    )
                } else {
                    String::new()
                };
                format!(
                    "Score: {:.2} | Trust: {} | Swaps: {} | Intents: {} | Follow-through: {} | ID: {}{}",
                    score,
                    level,
                    rep.swap_count,
                    rep.intent_count,
                    follow,
                    if rep.identity_verified { "verified" } else { "unverified" },
                    penalty_str
                )
            }
            None => "No reputation data".to_string(),
        }
    }
}
