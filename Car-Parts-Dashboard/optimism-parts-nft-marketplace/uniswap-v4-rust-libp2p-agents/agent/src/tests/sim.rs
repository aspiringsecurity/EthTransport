use crate::sim::{simulated_tx_hash, ExecutionMode, SimulationMode};

#[test]
fn simulation_mode_default_off() {
    let mode = SimulationMode::new(false, false);
    assert!(!mode.is_active());
}

#[test]
fn simulation_mode_toggle() {
    let mode = SimulationMode::new(false, false);
    mode.set(true);
    assert!(mode.is_active());
    mode.set(false);
    assert!(!mode.is_active());
}

#[test]
fn simulated_tx_hash_format() {
    let hash = simulated_tx_hash("12D3KooWTestPeerId123456789");
    assert!(hash.starts_with("0xSIM_"));
    let parts: Vec<&str> = hash.split('_').collect();
    assert_eq!(parts.len(), 3, "expected format: 0xSIM_<suffix>_<hex>");
    assert_eq!(parts[0], "0xSIM");
}

#[test]
fn simulated_tx_hash_contains_peer_suffix() {
    let peer_id = "12D3KooWTestPeerId123456789";
    let hash = simulated_tx_hash(peer_id);
    let expected_suffix = &peer_id[peer_id.len() - 8..];
    assert!(
        hash.contains(expected_suffix),
        "hash {hash} should contain peer suffix {expected_suffix}"
    );
}

#[test]
fn execution_mode_live_from_flags() {
    let mode = SimulationMode::new(false, false);
    assert_eq!(mode.get(), ExecutionMode::Live);
    assert!(!mode.is_active());
    assert!(!mode.is_local());
}

#[test]
fn execution_mode_simulate_from_flags() {
    let mode = SimulationMode::new(true, false);
    assert_eq!(mode.get(), ExecutionMode::Simulate);
    assert!(mode.is_active());
    assert!(!mode.is_local());
}

#[test]
fn execution_mode_local_from_flags() {
    let mode = SimulationMode::new(true, true);
    assert_eq!(mode.get(), ExecutionMode::Local);
    assert!(
        !mode.is_active(),
        "is_active() should be false for Local mode"
    );
    assert!(mode.is_local());
}

#[test]
fn execution_mode_labels() {
    assert_eq!(ExecutionMode::Live.label(), "LIVE (Sepolia)");
    assert_eq!(ExecutionMode::Simulate.label(), "SIMULATION");
    assert_eq!(ExecutionMode::Local.label(), "LOCAL (Anvil)");
}

#[test]
fn set_mode_to_local_at_runtime() {
    let mode = SimulationMode::new(true, false);
    assert!(mode.is_active());
    mode.set_mode(ExecutionMode::Local);
    assert!(mode.is_local());
    assert!(!mode.is_active());
}
