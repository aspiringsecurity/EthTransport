use std::time::{SystemTime, UNIX_EPOCH};

use crate::coordination::{
    generate_proposal_id, CoordinationBook, CoordinationStatus, SwapProposal, PROPOSAL_EXPIRY_SECS,
};

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn sample_proposal(id: &str, expires_at: u64) -> SwapProposal {
    SwapProposal {
        proposal_id: id.to_string(),
        initiator: "peer_abc123".to_string(),
        direction: "a2b".to_string(),
        amount: "100".to_string(),
        desired_direction: "b2a".to_string(),
        desired_amount: "100".to_string(),
        min_reputation: None,
        expires_at,
    }
}

#[test]
fn generate_proposal_id_format() {
    let id = generate_proposal_id("12D3KooWABC123");
    assert!(id.starts_with("prop_"));
    assert!(id.len() > 10);
}

#[test]
fn proposal_not_expired_when_fresh() {
    let p = sample_proposal("p1", now_secs() + 60);
    assert!(!p.is_expired());
}

#[test]
fn proposal_expired_when_past() {
    let p = sample_proposal("p1", now_secs() - 1);
    assert!(p.is_expired());
}

#[test]
fn matches_desired_direction() {
    let p = sample_proposal("p1", now_secs() + 60);
    assert!(p.matches_desired("b2a"));
    assert!(!p.matches_desired("a2b"));
}

#[test]
fn book_add_and_get() {
    let book = CoordinationBook::new();
    let p = sample_proposal("p1", now_secs() + 60);
    book.add_proposal(p);

    let (proposal, status) = book.get("p1").unwrap();
    assert_eq!(proposal.proposal_id, "p1");
    assert_eq!(status, CoordinationStatus::Pending);
}

#[test]
fn book_get_missing_returns_none() {
    let book = CoordinationBook::new();
    assert!(book.get("nonexistent").is_none());
}

#[test]
fn book_update_status() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("p1", now_secs() + 60));

    let updated = book.update_status(
        "p1",
        CoordinationStatus::Accepted {
            acceptor: "peer_xyz".to_string(),
        },
    );
    assert!(updated);

    let (_, status) = book.get("p1").unwrap();
    assert_eq!(
        status,
        CoordinationStatus::Accepted {
            acceptor: "peer_xyz".to_string(),
        }
    );
}

#[test]
fn book_update_nonexistent_returns_false() {
    let book = CoordinationBook::new();
    assert!(!book.update_status("nope", CoordinationStatus::Expired));
}

#[test]
fn book_active_proposals_excludes_expired() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("active", now_secs() + 60));
    book.add_proposal(sample_proposal("expired", now_secs() - 1));

    let active = book.active_proposals();
    assert_eq!(active.len(), 1);
    assert_eq!(active[0].0.proposal_id, "active");
}

#[test]
fn book_active_proposals_excludes_expired_status() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("p1", now_secs() + 60));
    book.update_status("p1", CoordinationStatus::Expired);

    let active = book.active_proposals();
    assert_eq!(active.len(), 0);
}

#[test]
fn book_cleanup_expired() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("active", now_secs() + 60));
    book.add_proposal(sample_proposal("old", now_secs() - 1));

    let cleaned = book.cleanup_expired();
    assert_eq!(cleaned, 1);

    let (_, status) = book.get("old").unwrap();
    assert_eq!(status, CoordinationStatus::Expired);
}

#[test]
fn book_all_returns_everything() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("p1", now_secs() + 60));
    book.add_proposal(sample_proposal("p2", now_secs() - 1));

    let all = book.all();
    assert_eq!(all.len(), 2);
}

#[test]
fn book_active_count() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("p1", now_secs() + 60));
    book.add_proposal(sample_proposal("p2", now_secs() + 60));
    book.add_proposal(sample_proposal("p3", now_secs() - 1));

    assert_eq!(book.active_count(), 2);
}

#[test]
fn full_coordination_lifecycle() {
    let book = CoordinationBook::new();
    let p = sample_proposal("lifecycle", now_secs() + 60);
    book.add_proposal(p);

    // Pending → Accepted
    book.update_status(
        "lifecycle",
        CoordinationStatus::Accepted {
            acceptor: "peer_b".to_string(),
        },
    );

    // Accepted → InitiatorExecuted
    book.update_status(
        "lifecycle",
        CoordinationStatus::InitiatorExecuted {
            tx_hash: "0xaaa".to_string(),
        },
    );

    // InitiatorExecuted → Completed
    book.update_status(
        "lifecycle",
        CoordinationStatus::Completed {
            tx_hash_a: "0xaaa".to_string(),
            tx_hash_b: "0xbbb".to_string(),
        },
    );

    let (_, status) = book.get("lifecycle").unwrap();
    assert_eq!(
        status,
        CoordinationStatus::Completed {
            tx_hash_a: "0xaaa".to_string(),
            tx_hash_b: "0xbbb".to_string(),
        }
    );
}

#[test]
fn book_thread_safe() {
    let book = CoordinationBook::new();
    let book2 = book.clone();

    book.add_proposal(sample_proposal("shared", now_secs() + 60));
    // Clone shares the same Arc<Mutex<_>>
    let result = book2.get("shared");
    assert!(result.is_some());
}

#[test]
fn proposal_expiry_constant() {
    assert_eq!(PROPOSAL_EXPIRY_SECS, 30);
}

#[test]
fn cleanup_expired_with_initiators_returns_ids() {
    let book = CoordinationBook::new();
    let mut p1 = sample_proposal("expired1", now_secs() - 1);
    p1.initiator = "peer_initiator_a".to_string();
    let mut p2 = sample_proposal("expired2", now_secs() - 1);
    p2.initiator = "peer_initiator_b".to_string();
    book.add_proposal(p1);
    book.add_proposal(p2);
    book.add_proposal(sample_proposal("active", now_secs() + 60));

    let initiators = book.cleanup_expired_with_initiators();
    assert_eq!(initiators.len(), 2);
    assert!(initiators.contains(&"peer_initiator_a".to_string()));
    assert!(initiators.contains(&"peer_initiator_b".to_string()));
}

#[test]
fn cleanup_expired_with_initiators_no_double_count() {
    let book = CoordinationBook::new();
    book.add_proposal(sample_proposal("expired1", now_secs() - 1));

    let first = book.cleanup_expired_with_initiators();
    assert_eq!(first.len(), 1);

    // Second call should find none — already marked Expired
    let second = book.cleanup_expired_with_initiators();
    assert_eq!(second.len(), 0);
}
