use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

/// Default quote expiry in seconds (30s).
pub const QUOTE_EXPIRY_SECS: u64 = 30;

/// Generate a short quote request ID from peer_id and timestamp.
pub fn generate_quote_id(peer_id: &str) -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let suffix = &peer_id[peer_id.len().saturating_sub(6)..];
    format!("quote_{suffix}_{now:x}")
}

/// Generate a short quote response ID from peer_id and timestamp.
pub fn generate_response_id(peer_id: &str) -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let suffix = &peer_id[peer_id.len().saturating_sub(6)..];
    format!("resp_{suffix}_{now:x}")
}

/// A quote request broadcast by an agent seeking price quotes from peers.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuoteRequest {
    pub quote_id: String,
    pub requester: String,
    pub direction: String,
    pub amount: String,
    pub min_reputation: Option<f64>,
    pub expires_at: u64,
}

impl QuoteRequest {
    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        now > self.expires_at
    }
}

/// A quote response from a peer offering terms for a requested swap.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuoteResponse {
    pub response_id: String,
    pub quote_id: String,
    pub responder: String,
    pub offered_amount: String,
    pub price: String,
    pub expires_at: u64,
}

impl QuoteResponse {
    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        now > self.expires_at
    }
}

/// Status of a quote request.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum QuoteStatus {
    /// Waiting for responses from peers.
    Open,
    /// At least one response received; requester is evaluating.
    Responded,
    /// Requester accepted a specific response.
    Accepted {
        response_id: String,
        responder: String,
    },
    /// Quote request expired without acceptance.
    Expired,
}

type QuoteEntry = (QuoteRequest, QuoteStatus, Vec<QuoteResponse>);

/// Tracks active quote requests, their status, and collected responses.
#[derive(Clone, Debug)]
pub struct QuoteBook {
    quotes: Arc<Mutex<HashMap<String, QuoteEntry>>>,
}

impl QuoteBook {
    pub fn new() -> Self {
        Self {
            quotes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Add a new quote request.
    pub fn add_request(&self, request: QuoteRequest) {
        let id = request.quote_id.clone();
        let mut book = self.quotes.lock().unwrap();
        book.insert(id, (request, QuoteStatus::Open, Vec::new()));
    }

    /// Get a quote request by ID.
    pub fn get(&self, quote_id: &str) -> Option<QuoteEntry> {
        self.quotes.lock().unwrap().get(quote_id).cloned()
    }

    /// Add a response to an existing quote request.
    /// Returns true if the quote existed and the response was added.
    pub fn add_response(&self, response: QuoteResponse) -> bool {
        let mut book = self.quotes.lock().unwrap();
        if let Some(entry) = book.get_mut(&response.quote_id) {
            entry.2.push(response);
            if entry.1 == QuoteStatus::Open {
                entry.1 = QuoteStatus::Responded;
            }
            true
        } else {
            false
        }
    }

    /// Update the status of a quote request.
    pub fn update_status(&self, quote_id: &str, status: QuoteStatus) -> bool {
        let mut book = self.quotes.lock().unwrap();
        if let Some(entry) = book.get_mut(quote_id) {
            entry.1 = status;
            true
        } else {
            false
        }
    }

    /// Get all active (non-expired) quote requests.
    pub fn active_quotes(&self) -> Vec<QuoteEntry> {
        let book = self.quotes.lock().unwrap();
        book.values()
            .filter(|(req, status, _)| !req.is_expired() && *status != QuoteStatus::Expired)
            .cloned()
            .collect()
    }

    /// Get all responses for a specific quote request.
    #[cfg(test)]
    pub fn responses_for(&self, quote_id: &str) -> Vec<QuoteResponse> {
        self.quotes
            .lock()
            .unwrap()
            .get(quote_id)
            .map(|(_, _, responses)| responses.clone())
            .unwrap_or_default()
    }

    /// Select the best response for a quote (highest offered_amount).
    pub fn best_response(&self, quote_id: &str) -> Option<QuoteResponse> {
        let book = self.quotes.lock().unwrap();
        book.get(quote_id).and_then(|(_, _, responses)| {
            responses
                .iter()
                .filter(|r| !r.is_expired())
                .max_by(|a, b| {
                    let a_val: f64 = a.offered_amount.parse().unwrap_or(0.0);
                    let b_val: f64 = b.offered_amount.parse().unwrap_or(0.0);
                    a_val.partial_cmp(&b_val).unwrap_or(std::cmp::Ordering::Equal)
                })
                .cloned()
        })
    }

    /// Clean up expired quotes and return requester peer IDs of newly expired ones.
    /// Only catches quotes transitioning to Expired for the first time,
    /// preventing double-counting for penalty tracking.
    pub fn cleanup_expired_with_requesters(&self) -> Vec<String> {
        let mut book = self.quotes.lock().unwrap();
        let newly_expired: Vec<(String, String)> = book
            .iter()
            .filter(|(_, (req, status, _))| req.is_expired() && *status != QuoteStatus::Expired)
            .map(|(id, (req, _, _))| (id.clone(), req.requester.clone()))
            .collect();
        let requesters: Vec<String> = newly_expired.iter().map(|(_, r)| r.clone()).collect();
        for (id, _) in &newly_expired {
            if let Some(entry) = book.get_mut(id) {
                entry.1 = QuoteStatus::Expired;
            }
        }
        requesters
    }

    /// Get all quotes (including expired).
    #[cfg(test)]
    pub fn all(&self) -> HashMap<String, QuoteEntry> {
        self.quotes.lock().unwrap().clone()
    }

    /// Count of active quotes.
    #[cfg(test)]
    pub fn active_count(&self) -> usize {
        self.active_quotes().len()
    }
}
