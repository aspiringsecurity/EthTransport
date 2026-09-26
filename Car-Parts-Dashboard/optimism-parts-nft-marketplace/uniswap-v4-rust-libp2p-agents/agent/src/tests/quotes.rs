use std::time::{SystemTime, UNIX_EPOCH};

use crate::quotes::{
    generate_quote_id, generate_response_id, QuoteBook, QuoteRequest, QuoteResponse, QuoteStatus,
    QUOTE_EXPIRY_SECS,
};

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn sample_request(id: &str, expires_at: u64) -> QuoteRequest {
    QuoteRequest {
        quote_id: id.to_string(),
        requester: "peer_abc123".to_string(),
        direction: "TKNA -> TKNB".to_string(),
        amount: "100".to_string(),
        min_reputation: None,
        expires_at,
    }
}

fn sample_response(response_id: &str, quote_id: &str, offered_amount: &str) -> QuoteResponse {
    QuoteResponse {
        response_id: response_id.to_string(),
        quote_id: quote_id.to_string(),
        responder: "peer_xyz789".to_string(),
        offered_amount: offered_amount.to_string(),
        price: "0.98".to_string(),
        expires_at: now_secs() + 60,
    }
}

// --- ID generation ---

#[test]
fn generate_quote_id_format() {
    let id = generate_quote_id("12D3KooWABC123");
    assert!(id.starts_with("quote_"));
    assert!(id.len() > 10);
}

#[test]
fn generate_response_id_format() {
    let id = generate_response_id("12D3KooWABC123");
    assert!(id.starts_with("resp_"));
    assert!(id.len() > 10);
}

// --- QuoteRequest expiry ---

#[test]
fn request_not_expired_when_fresh() {
    let r = sample_request("q1", now_secs() + 60);
    assert!(!r.is_expired());
}

#[test]
fn request_expired_when_past() {
    let r = sample_request("q1", now_secs() - 1);
    assert!(r.is_expired());
}

// --- QuoteResponse expiry ---

#[test]
fn response_not_expired_when_fresh() {
    let r = sample_response("r1", "q1", "98");
    assert!(!r.is_expired());
}

#[test]
fn response_expired_when_past() {
    let r = QuoteResponse {
        response_id: "r1".to_string(),
        quote_id: "q1".to_string(),
        responder: "peer_xyz".to_string(),
        offered_amount: "98".to_string(),
        price: "0.98".to_string(),
        expires_at: now_secs() - 1,
    };
    assert!(r.is_expired());
}

// --- QuoteBook CRUD ---

#[test]
fn book_add_and_get() {
    let book = QuoteBook::new();
    let r = sample_request("q1", now_secs() + 60);
    book.add_request(r);

    let (request, status, responses) = book.get("q1").unwrap();
    assert_eq!(request.quote_id, "q1");
    assert_eq!(status, QuoteStatus::Open);
    assert!(responses.is_empty());
}

#[test]
fn book_get_missing_returns_none() {
    let book = QuoteBook::new();
    assert!(book.get("nonexistent").is_none());
}

#[test]
fn book_add_response() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));

    let resp = sample_response("r1", "q1", "98");
    assert!(book.add_response(resp));

    let (_, _, responses) = book.get("q1").unwrap();
    assert_eq!(responses.len(), 1);
    assert_eq!(responses[0].response_id, "r1");
}

#[test]
fn book_add_response_to_missing_returns_false() {
    let book = QuoteBook::new();
    let resp = sample_response("r1", "nonexistent", "98");
    assert!(!book.add_response(resp));
}

#[test]
fn book_add_response_transitions_to_responded() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));

    let (_, status, _) = book.get("q1").unwrap();
    assert_eq!(status, QuoteStatus::Open);

    book.add_response(sample_response("r1", "q1", "98"));

    let (_, status, _) = book.get("q1").unwrap();
    assert_eq!(status, QuoteStatus::Responded);
}

#[test]
fn book_add_multiple_responses_stays_responded() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));

    book.add_response(sample_response("r1", "q1", "98"));
    book.add_response(sample_response("r2", "q1", "97"));

    let (_, status, responses) = book.get("q1").unwrap();
    assert_eq!(status, QuoteStatus::Responded);
    assert_eq!(responses.len(), 2);
}

// --- Status transitions ---

#[test]
fn book_update_status() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));

    let updated = book.update_status(
        "q1",
        QuoteStatus::Accepted {
            response_id: "r1".to_string(),
            responder: "peer_xyz".to_string(),
        },
    );
    assert!(updated);

    let (_, status, _) = book.get("q1").unwrap();
    assert_eq!(
        status,
        QuoteStatus::Accepted {
            response_id: "r1".to_string(),
            responder: "peer_xyz".to_string(),
        }
    );
}

#[test]
fn book_update_nonexistent_returns_false() {
    let book = QuoteBook::new();
    assert!(!book.update_status("nope", QuoteStatus::Expired));
}

#[test]
fn full_quote_lifecycle() {
    let book = QuoteBook::new();
    book.add_request(sample_request("lifecycle", now_secs() + 60));

    // Open → Responded (via add_response)
    book.add_response(sample_response("r1", "lifecycle", "98"));
    let (_, status, _) = book.get("lifecycle").unwrap();
    assert_eq!(status, QuoteStatus::Responded);

    // Responded → Accepted
    book.update_status(
        "lifecycle",
        QuoteStatus::Accepted {
            response_id: "r1".to_string(),
            responder: "peer_xyz789".to_string(),
        },
    );

    let (_, status, _) = book.get("lifecycle").unwrap();
    assert_eq!(
        status,
        QuoteStatus::Accepted {
            response_id: "r1".to_string(),
            responder: "peer_xyz789".to_string(),
        }
    );
}

// --- Filtering and cleanup ---

#[test]
fn book_active_quotes_excludes_expired() {
    let book = QuoteBook::new();
    book.add_request(sample_request("active", now_secs() + 60));
    book.add_request(sample_request("expired", now_secs() - 1));

    let active = book.active_quotes();
    assert_eq!(active.len(), 1);
    assert_eq!(active[0].0.quote_id, "active");
}

#[test]
fn book_active_quotes_excludes_expired_status() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    book.update_status("q1", QuoteStatus::Expired);

    let active = book.active_quotes();
    assert_eq!(active.len(), 0);
}

#[test]
fn book_cleanup_expired_with_requesters_returns_ids() {
    let book = QuoteBook::new();
    let mut r1 = sample_request("expired1", now_secs() - 1);
    r1.requester = "peer_requester_a".to_string();
    let mut r2 = sample_request("expired2", now_secs() - 1);
    r2.requester = "peer_requester_b".to_string();
    book.add_request(r1);
    book.add_request(r2);
    book.add_request(sample_request("active", now_secs() + 60));

    let requesters = book.cleanup_expired_with_requesters();
    assert_eq!(requesters.len(), 2);
    assert!(requesters.contains(&"peer_requester_a".to_string()));
    assert!(requesters.contains(&"peer_requester_b".to_string()));
}

#[test]
fn book_cleanup_expired_with_requesters_no_double_count() {
    let book = QuoteBook::new();
    book.add_request(sample_request("expired1", now_secs() - 1));

    let first = book.cleanup_expired_with_requesters();
    assert_eq!(first.len(), 1);

    // Second call should find none — already marked Expired
    let second = book.cleanup_expired_with_requesters();
    assert_eq!(second.len(), 0);
}

// --- Responses ---

#[test]
fn responses_for_returns_all() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    book.add_response(sample_response("r1", "q1", "98"));
    book.add_response(sample_response("r2", "q1", "97"));

    let responses = book.responses_for("q1");
    assert_eq!(responses.len(), 2);
}

#[test]
fn responses_for_missing_returns_empty() {
    let book = QuoteBook::new();
    let responses = book.responses_for("nonexistent");
    assert!(responses.is_empty());
}

// --- Best response ---

#[test]
fn best_response_selects_highest_offered_amount() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    book.add_response(sample_response("r1", "q1", "95"));
    book.add_response(sample_response("r2", "q1", "99"));
    book.add_response(sample_response("r3", "q1", "97"));

    let best = book.best_response("q1").unwrap();
    assert_eq!(best.response_id, "r2");
    assert_eq!(best.offered_amount, "99");
}

#[test]
fn best_response_returns_none_for_missing() {
    let book = QuoteBook::new();
    assert!(book.best_response("nonexistent").is_none());
}

#[test]
fn best_response_returns_none_when_no_responses() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    assert!(book.best_response("q1").is_none());
}

// --- Thread safety ---

#[test]
fn book_thread_safe() {
    let book = QuoteBook::new();
    let book2 = book.clone();

    book.add_request(sample_request("shared", now_secs() + 60));
    // Clone shares the same Arc<Mutex<_>>
    let result = book2.get("shared");
    assert!(result.is_some());
}

// --- Constants ---

#[test]
fn quote_expiry_constant() {
    assert_eq!(QUOTE_EXPIRY_SECS, 30);
}

// --- All and active_count ---

#[test]
fn book_all_returns_everything() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    book.add_request(sample_request("q2", now_secs() - 1));

    let all = book.all();
    assert_eq!(all.len(), 2);
}

#[test]
fn book_active_count() {
    let book = QuoteBook::new();
    book.add_request(sample_request("q1", now_secs() + 60));
    book.add_request(sample_request("q2", now_secs() + 60));
    book.add_request(sample_request("q3", now_secs() - 1));

    assert_eq!(book.active_count(), 2);
}
