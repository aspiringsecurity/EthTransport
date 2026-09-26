use crate::reputation::{
    ConditionResult, PeerReputation, ReputationStore, SwapConditions, TrustLevel, MAX_PENALTY,
    PENALTY_EXPIRED_PROPOSAL, PENALTY_INVALID_MESSAGE, PENALTY_UNFOLLOWED_INTENT,
    WEIGHT_FOLLOW_THROUGH, WEIGHT_IDENTITY, WEIGHT_RECENCY, WEIGHT_SWAP_COUNT,
};

#[test]
fn weights_sum_to_one() {
    let sum = WEIGHT_SWAP_COUNT + WEIGHT_IDENTITY + WEIGHT_FOLLOW_THROUGH + WEIGHT_RECENCY;
    assert!((sum - 1.0).abs() < f64::EPSILON);
}

#[test]
fn new_peer_has_zero_score() {
    let rep = PeerReputation::new("peer1".to_string());
    assert_eq!(rep.swap_count, 0);
    assert_eq!(rep.intent_count, 0);
    assert!(!rep.identity_verified);
    // No activity at all (swap_count == 0 && intent_count == 0) → follow_through = 0.0,
    // recency is 0 (no activity), so score = 0.0
    let score = rep.composite_score();
    assert!((score - 0.0).abs() < 0.01);
}

#[test]
fn identity_verified_increases_score() {
    let mut rep = PeerReputation::new("peer1".to_string());
    let before = rep.composite_score();
    rep.identity_verified = true;
    let after = rep.composite_score();
    assert!(after > before);
    assert!((after - before - WEIGHT_IDENTITY).abs() < 0.01);
}

#[test]
fn swap_count_increases_score() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.last_active = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let before = rep.composite_score();
    rep.swap_count = 10;
    let after = rep.composite_score();
    assert!(after > before);
}

#[test]
fn max_swap_count_saturates() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.swap_count = 50;
    let score_at_max = rep.composite_score();
    rep.swap_count = 100;
    let score_beyond = rep.composite_score();
    // Swap component should be the same once saturated
    assert!((score_at_max - score_beyond).abs() < 0.01);
}

#[test]
fn follow_through_ratio_perfect() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.intent_count = 10;
    rep.swap_count = 10;
    // Follow-through = 10/10 = 1.0 → full weight
    let score = rep.composite_score();
    let swap_component = WEIGHT_SWAP_COUNT * (10.0 / 50.0);
    let follow_component = WEIGHT_FOLLOW_THROUGH * 1.0;
    assert!(score >= swap_component + follow_component - 0.01);
}

#[test]
fn follow_through_ratio_poor() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.intent_count = 10;
    rep.swap_count = 2;
    // Follow-through = 2/10 = 0.2
    let follow = rep.swap_count as f64 / rep.intent_count as f64;
    assert!((follow - 0.2).abs() < f64::EPSILON);
}

#[test]
fn no_intents_gives_neutral_follow_through() {
    // When swap_count > 0 but intent_count == 0, follow_through = 1.0 (full credit)
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.swap_count = 5;
    rep.last_active = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let score = rep.composite_score();
    // Should include follow_through component (0.25)
    assert!(score >= WEIGHT_FOLLOW_THROUGH - 0.01);

    // When both are 0, follow_through = 0.0 (no credit for no activity)
    let empty = PeerReputation::new("peer2".to_string());
    assert!((empty.composite_score() - 0.0).abs() < 0.01);
}

#[test]
fn recency_score_decays_over_time() {
    let mut rep = PeerReputation::new("peer1".to_string());
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Just active
    rep.last_active = now;
    let recent = rep.recency_score_at(now);
    assert!((recent - 1.0).abs() < 0.01);

    // 24 hours ago (one half-life)
    rep.last_active = now - 86400;
    let day_old = rep.recency_score_at(now);
    assert!((day_old - 0.5).abs() < 0.01);

    // 48 hours ago (two half-lives)
    rep.last_active = now - 172800;
    let two_days = rep.recency_score_at(now);
    assert!((two_days - 0.25).abs() < 0.01);
}

#[test]
fn recency_zero_when_never_active() {
    let rep = PeerReputation::new("peer1".to_string());
    assert_eq!(rep.recency_score(), 0.0);
}

#[test]
fn trust_level_thresholds() {
    assert_eq!(TrustLevel::from_score(0.0), TrustLevel::Unknown);
    assert_eq!(TrustLevel::from_score(-0.1), TrustLevel::Unknown);
    assert_eq!(TrustLevel::from_score(0.1), TrustLevel::Low);
    assert_eq!(TrustLevel::from_score(0.3), TrustLevel::Low);
    assert_eq!(TrustLevel::from_score(0.31), TrustLevel::Medium);
    assert_eq!(TrustLevel::from_score(0.6), TrustLevel::Medium);
    assert_eq!(TrustLevel::from_score(0.61), TrustLevel::High);
    assert_eq!(TrustLevel::from_score(0.85), TrustLevel::High);
    assert_eq!(TrustLevel::from_score(0.86), TrustLevel::Trusted);
    assert_eq!(TrustLevel::from_score(1.0), TrustLevel::Trusted);
}

#[test]
fn trust_level_display() {
    assert_eq!(format!("{}", TrustLevel::Unknown), "Unknown");
    assert_eq!(format!("{}", TrustLevel::Low), "Low");
    assert_eq!(format!("{}", TrustLevel::Medium), "Medium");
    assert_eq!(format!("{}", TrustLevel::High), "High");
    assert_eq!(format!("{}", TrustLevel::Trusted), "Trusted");
}

#[test]
fn reputation_store_record_swap() {
    let store = ReputationStore::new();
    store.record_swap("peer1");
    store.record_swap("peer1");
    store.record_swap("peer2");

    let rep1 = store.get("peer1").unwrap();
    assert_eq!(rep1.swap_count, 2);
    assert!(rep1.last_active > 0);

    let rep2 = store.get("peer2").unwrap();
    assert_eq!(rep2.swap_count, 1);
}

#[test]
fn reputation_store_record_intent() {
    let store = ReputationStore::new();
    store.record_intent("peer1");
    store.record_intent("peer1");

    let rep = store.get("peer1").unwrap();
    assert_eq!(rep.intent_count, 2);
    assert_eq!(rep.swap_count, 0);
}

#[test]
fn reputation_store_set_identity() {
    let store = ReputationStore::new();
    store.set_identity_verified("peer1", true);

    let rep = store.get("peer1").unwrap();
    assert!(rep.identity_verified);

    store.set_identity_verified("peer1", false);
    let rep = store.get("peer1").unwrap();
    assert!(!rep.identity_verified);
}

#[test]
fn reputation_store_score_unknown_peer() {
    let store = ReputationStore::new();
    assert_eq!(store.score("nonexistent"), 0.0);
    assert_eq!(store.trust_level("nonexistent"), TrustLevel::Unknown);
}

#[test]
fn reputation_store_all() {
    let store = ReputationStore::new();
    store.record_swap("peer1");
    store.record_swap("peer2");

    let all = store.all();
    assert_eq!(all.len(), 2);
    assert!(all.contains_key("peer1"));
    assert!(all.contains_key("peer2"));
}

#[test]
fn reputation_store_summary_with_data() {
    let store = ReputationStore::new();
    store.record_swap("peer1");
    store.record_intent("peer1");
    store.set_identity_verified("peer1", true);

    let summary = store.summary("peer1");
    assert!(summary.contains("Score:"));
    assert!(summary.contains("Trust:"));
    assert!(summary.contains("Swaps: 1"));
    assert!(summary.contains("Intents: 1"));
    assert!(summary.contains("verified"));
}

#[test]
fn reputation_store_summary_no_data() {
    let store = ReputationStore::new();
    assert_eq!(store.summary("unknown"), "No reputation data");
}

#[test]
fn reputation_store_thread_safe() {
    let store = ReputationStore::new();
    let store2 = store.clone();

    store.record_swap("peer1");
    // Clone shares the same Arc<Mutex<_>>
    let rep = store2.get("peer1").unwrap();
    assert_eq!(rep.swap_count, 1);
}

// --- Conditional swap tests ---

#[test]
fn empty_conditions_always_pass() {
    let conditions = SwapConditions::default();
    assert!(conditions.is_empty());
    let store = ReputationStore::new();
    assert!(conditions.evaluate("peer1", &store).is_passed());
}

#[test]
fn min_reputation_passes_when_met() {
    let store = ReputationStore::new();
    // Build up reputation
    for _ in 0..20 {
        store.record_swap("peer1");
    }
    store.set_identity_verified("peer1", true);

    let conditions = SwapConditions {
        min_reputation: Some(0.2),
        ..Default::default()
    };
    assert!(conditions.evaluate("peer1", &store).is_passed());
}

#[test]
fn min_reputation_fails_when_too_low() {
    let store = ReputationStore::new();
    // No swaps, no identity → low score
    let conditions = SwapConditions {
        min_reputation: Some(0.9),
        ..Default::default()
    };
    match conditions.evaluate("peer1", &store) {
        ConditionResult::Failed(reason) => {
            assert!(reason.contains("Reputation too low"));
        }
        ConditionResult::Passed => panic!("Should have failed"),
    }
}

#[test]
fn invalid_price_bound_fails() {
    let store = ReputationStore::new();
    let conditions = SwapConditions {
        min_price: Some("not_a_number".to_string()),
        ..Default::default()
    };
    match conditions.evaluate("peer1", &store) {
        ConditionResult::Failed(reason) => {
            assert!(reason.contains("Invalid min_price"));
        }
        ConditionResult::Passed => panic!("Should have failed"),
    }
}

#[test]
fn valid_price_bounds_pass() {
    let store = ReputationStore::new();
    let conditions = SwapConditions {
        min_price: Some("0.95".to_string()),
        max_price: Some("1.05".to_string()),
        ..Default::default()
    };
    assert!(conditions.evaluate("peer1", &store).is_passed());
}

#[test]
fn combined_conditions_all_checked() {
    let store = ReputationStore::new();
    // Fails on reputation (no data, score ~0)
    let conditions = SwapConditions {
        min_reputation: Some(0.5),
        min_price: Some("0.95".to_string()),
        max_price: Some("1.05".to_string()),
    };
    assert!(!conditions.evaluate("peer1", &store).is_passed());

    // Now build reputation
    for _ in 0..25 {
        store.record_swap("peer1");
    }
    store.set_identity_verified("peer1", true);
    // Should pass now
    assert!(conditions.evaluate("peer1", &store).is_passed());
}

#[test]
fn peer_reputation_serialization_roundtrip() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.swap_count = 5;
    rep.intent_count = 3;
    rep.identity_verified = true;
    rep.last_active = 1700000000;

    let json = serde_json::to_string(&rep).unwrap();
    let parsed: PeerReputation = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed.peer_id, "peer1");
    assert_eq!(parsed.swap_count, 5);
    assert_eq!(parsed.intent_count, 3);
    assert!(parsed.identity_verified);
    assert_eq!(parsed.last_active, 1700000000);
}

// --- Misbehavior penalty tests ---

#[test]
fn invalid_message_reduces_score() {
    let store = ReputationStore::new();
    for _ in 0..10 {
        store.record_swap("peer1");
    }
    store.set_identity_verified("peer1", true);
    let before = store.score("peer1");

    store.record_invalid_message("peer1");
    let after = store.score("peer1");
    assert!(
        after < before,
        "Score should decrease after invalid message"
    );
}

#[test]
fn penalty_score_capped_at_max() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.invalid_message_count = 100;
    let penalty = rep.penalty_score();
    assert!((penalty - MAX_PENALTY).abs() < f64::EPSILON);
}

#[test]
fn composite_score_clamped_at_zero() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.invalid_message_count = 100;
    let score = rep.composite_score();
    assert!(score >= 0.0, "Score should never go below 0.0");
}

#[test]
fn multiple_penalty_types_accumulate() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.invalid_message_count = 1;
    rep.unfollowed_intent_count = 1;
    rep.expired_proposal_count = 1;
    let penalty = rep.penalty_score();
    let expected = PENALTY_INVALID_MESSAGE + PENALTY_UNFOLLOWED_INTENT + PENALTY_EXPIRED_PROPOSAL;
    assert!((penalty - expected).abs() < f64::EPSILON);
}

#[test]
fn record_invalid_message() {
    let store = ReputationStore::new();
    store.record_invalid_message("peer1");
    store.record_invalid_message("peer1");
    let rep = store.get("peer1").unwrap();
    assert_eq!(rep.invalid_message_count, 2);
}

#[test]
fn record_unfollowed_intent() {
    let store = ReputationStore::new();
    store.record_unfollowed_intent("peer1");
    let rep = store.get("peer1").unwrap();
    assert_eq!(rep.unfollowed_intent_count, 1);
}

#[test]
fn record_expired_proposal() {
    let store = ReputationStore::new();
    store.record_expired_proposal("peer1");
    let rep = store.get("peer1").unwrap();
    assert_eq!(rep.expired_proposal_count, 1);
}

#[test]
fn cleanup_stale_peers_keeps_recent() {
    let store = ReputationStore::new();
    store.record_swap("active_peer");
    let removed = store.cleanup_stale_peers();
    assert_eq!(removed, 0, "Recently active peer should not be cleaned up");
    assert!(store.get("active_peer").is_some());
}

#[test]
fn all_scores_returns_correct_data() {
    let store = ReputationStore::new();
    store.record_swap("peer1");
    store.record_swap("peer2");
    let scores = store.all_scores();
    assert_eq!(scores.len(), 2);
    for (_, score) in &scores {
        assert!(*score >= 0.0);
        assert!(*score <= 1.0);
    }
}

#[test]
fn penalty_fields_serde_default() {
    // Simulate deserializing old data without penalty fields
    let json = r#"{"peer_id":"peer1","swap_count":5,"intent_count":3,"identity_verified":true,"last_active":1700000000}"#;
    let parsed: PeerReputation = serde_json::from_str(json).unwrap();
    assert_eq!(parsed.invalid_message_count, 0);
    assert_eq!(parsed.unfollowed_intent_count, 0);
    assert_eq!(parsed.expired_proposal_count, 0);
}

#[test]
fn penalty_fields_serialization_roundtrip() {
    let mut rep = PeerReputation::new("peer1".to_string());
    rep.invalid_message_count = 3;
    rep.unfollowed_intent_count = 2;
    rep.expired_proposal_count = 1;
    let json = serde_json::to_string(&rep).unwrap();
    let parsed: PeerReputation = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed.invalid_message_count, 3);
    assert_eq!(parsed.unfollowed_intent_count, 2);
    assert_eq!(parsed.expired_proposal_count, 1);
}

#[test]
fn summary_shows_penalties_when_present() {
    let store = ReputationStore::new();
    store.record_invalid_message("peer1");
    let summary = store.summary("peer1");
    assert!(summary.contains("Penalties"));
    assert!(summary.contains("invalid=1"));
}
