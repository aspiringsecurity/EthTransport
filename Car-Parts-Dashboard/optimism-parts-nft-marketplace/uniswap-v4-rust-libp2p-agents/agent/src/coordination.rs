use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

/// Default proposal expiry in seconds (30s).
pub const PROPOSAL_EXPIRY_SECS: u64 = 30;

/// Generate a short proposal ID from peer_id and timestamp.
pub fn generate_proposal_id(peer_id: &str) -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let suffix = &peer_id[peer_id.len().saturating_sub(6)..];
    format!("prop_{suffix}_{now:x}")
}

/// A swap proposal broadcast by an initiator seeking a counterparty.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwapProposal {
    pub proposal_id: String,
    pub initiator: String,
    pub direction: String,
    pub amount: String,
    pub desired_direction: String,
    pub desired_amount: String,
    pub min_reputation: Option<f64>,
    pub expires_at: u64,
}

impl SwapProposal {
    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        now > self.expires_at
    }

    /// Check if a direction matches the desired counter-swap.
    #[cfg(test)]
    pub fn matches_desired(&self, direction: &str) -> bool {
        self.desired_direction == direction
    }
}

/// Status of a coordinated swap.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoordinationStatus {
    /// Waiting for a counterparty to accept.
    Pending,
    /// A counterparty accepted; initiator should execute.
    Accepted { acceptor: String },
    /// Initiator executed; waiting for counterparty.
    InitiatorExecuted { tx_hash: String },
    /// Both sides executed successfully.
    Completed {
        tx_hash_a: String,
        tx_hash_b: String,
    },
    /// Proposal expired or was cancelled.
    Expired,
}

/// Tracks active coordination proposals and their state.
#[derive(Clone, Debug)]
pub struct CoordinationBook {
    proposals: Arc<Mutex<HashMap<String, (SwapProposal, CoordinationStatus)>>>,
}

impl CoordinationBook {
    pub fn new() -> Self {
        Self {
            proposals: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Add a new proposal.
    pub fn add_proposal(&self, proposal: SwapProposal) {
        let id = proposal.proposal_id.clone();
        let mut book = self.proposals.lock().unwrap();
        book.insert(id, (proposal, CoordinationStatus::Pending));
    }

    /// Get a proposal by ID.
    pub fn get(&self, proposal_id: &str) -> Option<(SwapProposal, CoordinationStatus)> {
        self.proposals.lock().unwrap().get(proposal_id).cloned()
    }

    /// Update the status of a proposal.
    pub fn update_status(&self, proposal_id: &str, status: CoordinationStatus) -> bool {
        let mut book = self.proposals.lock().unwrap();
        if let Some(entry) = book.get_mut(proposal_id) {
            entry.1 = status;
            true
        } else {
            false
        }
    }

    /// Get all active (non-expired) proposals.
    pub fn active_proposals(&self) -> Vec<(SwapProposal, CoordinationStatus)> {
        let book = self.proposals.lock().unwrap();
        book.values()
            .filter(|(p, s)| !p.is_expired() && *s != CoordinationStatus::Expired)
            .cloned()
            .collect()
    }

    /// Get all proposals (including expired).
    #[cfg(test)]
    pub fn all(&self) -> HashMap<String, (SwapProposal, CoordinationStatus)> {
        self.proposals.lock().unwrap().clone()
    }

    /// Remove expired proposals and return the count removed.
    pub fn cleanup_expired(&self) -> usize {
        let mut book = self.proposals.lock().unwrap();
        let expired: Vec<String> = book
            .iter()
            .filter(|(_, (p, _))| p.is_expired())
            .map(|(id, _)| id.clone())
            .collect();
        let count = expired.len();
        for id in expired {
            if let Some(entry) = book.get_mut(&id) {
                entry.1 = CoordinationStatus::Expired;
            }
        }
        count
    }

    /// Clean up expired proposals and return initiator peer IDs of newly expired ones.
    /// Unlike `cleanup_expired()`, this only catches proposals transitioning to Expired
    /// for the first time, preventing double-counting for penalty tracking.
    pub fn cleanup_expired_with_initiators(&self) -> Vec<String> {
        let mut book = self.proposals.lock().unwrap();
        let newly_expired: Vec<(String, String)> = book
            .iter()
            .filter(|(_, (p, s))| p.is_expired() && *s != CoordinationStatus::Expired)
            .map(|(id, (p, _))| (id.clone(), p.initiator.clone()))
            .collect();
        let initiators: Vec<String> = newly_expired.iter().map(|(_, init)| init.clone()).collect();
        for (id, _) in &newly_expired {
            if let Some(entry) = book.get_mut(id) {
                entry.1 = CoordinationStatus::Expired;
            }
        }
        initiators
    }

    /// Count of active proposals.
    #[cfg(test)]
    pub fn active_count(&self) -> usize {
        self.active_proposals().len()
    }
}
