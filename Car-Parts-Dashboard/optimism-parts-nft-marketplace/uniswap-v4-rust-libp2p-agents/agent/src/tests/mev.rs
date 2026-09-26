use alloy::primitives::U256;

use crate::mev::{
    compute_amount_out_min, compute_realized_slippage_bps, is_sandwich, MevStore,
    DEFAULT_MAX_SLIPPAGE_BPS, SANDWICH_THRESHOLD_BPS,
};

fn wei(tokens: u64) -> U256 {
    U256::from(tokens) * U256::from(10u64.pow(18))
}

// ── compute_amount_out_min ──────────────────────────────────────────────────

#[test]
fn amount_out_min_zero_slippage() {
    let amount = wei(100);
    let out_min = compute_amount_out_min(amount, 0);
    assert_eq!(out_min, amount, "zero slippage => amountOutMin == amountIn");
}

#[test]
fn amount_out_min_fifty_bps() {
    // 100 tokens, 50 bps (0.5%) slippage → floor = 99.5 tokens
    let amount = wei(100);
    let out_min = compute_amount_out_min(amount, 50);
    let expected = wei(100) * U256::from(9950u64) / U256::from(10_000u64);
    assert_eq!(out_min, expected);
}

#[test]
fn amount_out_min_hundred_bps() {
    // 100 tokens, 100 bps (1%) → floor = 99 tokens
    let amount = wei(100);
    let out_min = compute_amount_out_min(amount, 100);
    let expected = wei(100) * U256::from(9900u64) / U256::from(10_000u64);
    assert_eq!(out_min, expected);
}

#[test]
fn amount_out_min_clamps_at_9999_bps() {
    // 10000 bps would give 0 — clamped to 9999 so floor > 0
    let amount = wei(100);
    let out_min = compute_amount_out_min(amount, 10_000);
    let clamped = compute_amount_out_min(amount, 9_999);
    assert_eq!(out_min, clamped, "10000 bps clamps to 9999");
    assert!(out_min > U256::ZERO);
}

#[test]
fn amount_out_min_default_config() {
    let amount = wei(50);
    let out_min = compute_amount_out_min(amount, DEFAULT_MAX_SLIPPAGE_BPS);
    // Should be slightly less than input but close
    assert!(out_min < amount);
    assert!(out_min > wei(49)); // 49.75 tokens
}

// ── compute_realized_slippage_bps ───────────────────────────────────────────

#[test]
fn slippage_bps_no_slippage() {
    // actual == expected → 0 slippage
    let expected = wei(100);
    assert_eq!(compute_realized_slippage_bps(expected, expected), 0);
}

#[test]
fn slippage_bps_better_than_expected() {
    // actual > expected → 0 (favourable, not reported as slippage)
    let expected = wei(100);
    let actual = wei(101);
    assert_eq!(compute_realized_slippage_bps(expected, actual), 0);
}

#[test]
fn slippage_bps_half_percent() {
    // 100 → 99.5 tokens = 50 bps
    let expected = wei(100);
    let actual = wei(100) * U256::from(9950u64) / U256::from(10_000u64);
    assert_eq!(compute_realized_slippage_bps(expected, actual), 50);
}

#[test]
fn slippage_bps_one_percent() {
    let expected = wei(100);
    let actual = wei(99);
    assert_eq!(compute_realized_slippage_bps(expected, actual), 100);
}

#[test]
fn slippage_bps_zero_expected_returns_zero() {
    assert_eq!(compute_realized_slippage_bps(U256::ZERO, wei(50)), 0);
}

// ── is_sandwich ─────────────────────────────────────────────────────────────

#[test]
fn is_sandwich_below_threshold() {
    // 1% slippage < SANDWICH_THRESHOLD_BPS (200) → not a sandwich
    let expected = wei(100);
    let actual = wei(99);
    assert!(!is_sandwich(expected, actual));
}

#[test]
fn is_sandwich_at_threshold() {
    // exactly at threshold (200 bps = 2%) → not a sandwich (threshold is strict >)
    let expected = U256::from(10_000u64);
    let actual = U256::from(9_800u64); // exactly 200 bps below
    assert!(!is_sandwich(expected, actual));
}

#[test]
fn is_sandwich_above_threshold() {
    // 3% slippage > SANDWICH_THRESHOLD_BPS (200) → sandwich
    let expected = wei(100);
    let actual = wei(97);
    assert!(is_sandwich(expected, actual));
}

#[test]
fn is_sandwich_extreme_slippage() {
    let expected = wei(100);
    let actual = wei(50); // 50% slippage
    assert!(is_sandwich(expected, actual));
}

#[test]
fn sandwich_threshold_constant_is_200() {
    assert_eq!(SANDWICH_THRESHOLD_BPS, 200);
}

// ── MevStore ─────────────────────────────────────────────────────────────────

#[test]
fn mev_store_default_slippage() {
    let store = MevStore::new();
    assert_eq!(store.max_slippage_bps(), DEFAULT_MAX_SLIPPAGE_BPS);
}

#[test]
fn mev_store_set_slippage() {
    let store = MevStore::new();
    store.set_max_slippage_bps(100);
    assert_eq!(store.max_slippage_bps(), 100);
}

#[test]
fn mev_store_own_summary_empty() {
    let store = MevStore::new();
    let summary = store.own_summary();
    assert_eq!(summary.total_swaps, 0);
    assert_eq!(summary.sandwich_count, 0);
    assert_eq!(summary.avg_slippage_bps, 0);
    assert_eq!(summary.worst_slippage_bps, 0);
}

#[test]
fn mev_store_record_event_normal() {
    let store = MevStore::new();
    store.record_event(crate::mev::MevEvent {
        direction: "TKNA -> TKNB".into(),
        amount_in: wei(100),
        amount_out_min: wei(99),
        actual_out: wei(99),
        realized_slippage_bps: 100,
        sandwich_detected: false,
        timestamp: 0,
    });
    let summary = store.own_summary();
    assert_eq!(summary.total_swaps, 1);
    assert_eq!(summary.sandwich_count, 0);
    assert_eq!(summary.avg_slippage_bps, 100);
    assert_eq!(summary.worst_slippage_bps, 100);
}

#[test]
fn mev_store_record_sandwich_event() {
    let store = MevStore::new();
    store.record_event(crate::mev::MevEvent {
        direction: "TKNB -> TKNA".into(),
        amount_in: wei(100),
        amount_out_min: wei(99),
        actual_out: wei(95),
        realized_slippage_bps: 500,
        sandwich_detected: true,
        timestamp: 1000,
    });
    let summary = store.own_summary();
    assert_eq!(summary.total_swaps, 1);
    assert_eq!(summary.sandwich_count, 1);
    assert_eq!(summary.worst_slippage_bps, 500);
}

#[test]
fn mev_store_avg_slippage_multiple_events() {
    let store = MevStore::new();
    for bps in [100u64, 200, 300] {
        store.record_event(crate::mev::MevEvent {
            direction: "TKNA -> TKNB".into(),
            amount_in: wei(100),
            amount_out_min: wei(99),
            actual_out: U256::ZERO,
            realized_slippage_bps: bps,
            sandwich_detected: bps > SANDWICH_THRESHOLD_BPS,
            timestamp: 0,
        });
    }
    let summary = store.own_summary();
    assert_eq!(summary.total_swaps, 3);
    assert_eq!(summary.avg_slippage_bps, 200); // (100+200+300)/3
    assert_eq!(summary.worst_slippage_bps, 300);
    assert_eq!(summary.sandwich_count, 1); // only 300 > 200
}

#[test]
fn mev_store_record_peer_alert() {
    let store = MevStore::new();
    store.record_peer_alert("peer1", 250, true);
    store.record_peer_alert("peer1", 150, false);
    let stats = store.peer_stats_all();
    let peer = stats.get("peer1").unwrap();
    assert_eq!(peer.alerts_received, 2);
    assert_eq!(peer.sandwich_count, 1);
    assert_eq!(peer.total_slippage_bps, 400);
    assert_eq!(peer.avg_slippage_bps(), 200);
}

#[test]
fn mev_store_peer_stats_independent() {
    let store = MevStore::new();
    store.record_peer_alert("peer1", 100, false);
    store.record_peer_alert("peer2", 300, true);
    let stats = store.peer_stats_all();
    assert_eq!(stats.len(), 2);
    assert_eq!(stats["peer1"].alerts_received, 1);
    assert_eq!(stats["peer2"].sandwich_count, 1);
}

#[test]
fn mev_store_thread_safety() {
    use std::sync::Arc;
    use std::thread;

    let store = Arc::new(MevStore::new());
    let mut handles = vec![];
    for i in 0..4 {
        let s = Arc::clone(&store);
        handles.push(thread::spawn(move || {
            s.record_event(crate::mev::MevEvent {
                direction: "TKNA -> TKNB".into(),
                amount_in: wei(10),
                amount_out_min: wei(9),
                actual_out: wei(9),
                realized_slippage_bps: i * 50,
                sandwich_detected: false,
                timestamp: i as u64,
            });
            s.record_peer_alert(&format!("peer{i}"), i * 10, false);
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    let summary = store.own_summary();
    assert_eq!(summary.total_swaps, 4);
    assert_eq!(store.peer_stats_all().len(), 4);
}
