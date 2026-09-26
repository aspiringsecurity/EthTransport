use crate::archival::{to_ndjson, LogArchiver, LogEntry};

#[test]
fn log_entry_swap_executed_serialization() {
    let entry = LogEntry::swap_executed("peer123", "A->B", "1000000", "0xabc123");
    let json = serde_json::to_string(&entry).unwrap();
    assert!(json.contains("\"type\":\"SwapExecuted\""));
    assert!(json.contains("\"agent\":\"peer123\""));
    assert!(json.contains("\"tx_hash\":\"0xabc123\""));

    let parsed: LogEntry = serde_json::from_str(&json).unwrap();
    match parsed {
        LogEntry::SwapExecuted { agent, tx_hash, .. } => {
            assert_eq!(agent, "peer123");
            assert_eq!(tx_hash, "0xabc123");
        }
        _ => panic!("Expected SwapExecuted"),
    }
}

#[test]
fn log_entry_identity_attestation_serialization() {
    let entry = LogEntry::identity_attestation("peer456", "0xdeadbeef", true);
    let json = serde_json::to_string(&entry).unwrap();
    assert!(json.contains("\"type\":\"IdentityAttestation\""));
    assert!(json.contains("\"verified\":true"));

    let parsed: LogEntry = serde_json::from_str(&json).unwrap();
    match parsed {
        LogEntry::IdentityAttestation {
            peer_id, verified, ..
        } => {
            assert_eq!(peer_id, "peer456");
            assert!(verified);
        }
        _ => panic!("Expected IdentityAttestation"),
    }
}

#[test]
fn ndjson_format() {
    let entries = vec![
        LogEntry::swap_executed("a", "A->B", "100", "0x1"),
        LogEntry::swap_executed("b", "B->A", "200", "0x2"),
    ];
    let ndjson = to_ndjson(&entries).unwrap();
    let lines: Vec<&str> = ndjson.lines().collect();
    assert_eq!(lines.len(), 2);
    assert!(lines[0].contains("\"agent\":\"a\""));
    assert!(lines[1].contains("\"agent\":\"b\""));
}

#[test]
fn log_archiver_buffer_operations() {
    let archiver = LogArchiver::new();
    assert_eq!(archiver.buffer_len(), 0);

    archiver.log(LogEntry::swap_executed("p1", "A->B", "100", "0x1"));
    assert_eq!(archiver.buffer_len(), 1);

    archiver.log(LogEntry::identity_attestation("p2", "0xabc", true));
    assert_eq!(archiver.buffer_len(), 2);
}

#[test]
fn log_archiver_default_sidecar_url() {
    // Without SIDECAR_URL env var, defaults to localhost:3001
    let archiver = LogArchiver::new();
    assert!(archiver.sidecar_url().contains("localhost"));
    assert!(archiver.sidecar_url().contains("3001"));
}

#[tokio::test]
async fn flush_empty_buffer_fails() {
    let archiver = LogArchiver::new();
    let result = archiver.flush().await;
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("log buffer is empty"));
}

#[tokio::test]
async fn flush_sidecar_unreachable_fails() {
    let archiver = LogArchiver::new();
    archiver.log(LogEntry::swap_executed("p1", "A->B", "100", "0x1"));
    // No sidecar running — should fail with connection error
    let result = archiver.flush().await;
    assert!(result.is_err());
}

#[test]
fn log_entry_timestamps_present() {
    let swap = LogEntry::swap_executed("p1", "A->B", "100", "0x1");
    let json = serde_json::to_string(&swap).unwrap();
    // ISO-8601 timestamps contain 'T' separator and '+' or 'Z' timezone
    assert!(json.contains("\"timestamp\":\""));
    assert!(json.contains("T"));

    let identity = LogEntry::identity_attestation("p2", "0xabc", true);
    let json = serde_json::to_string(&identity).unwrap();
    assert!(json.contains("\"timestamp\":\""));
}
