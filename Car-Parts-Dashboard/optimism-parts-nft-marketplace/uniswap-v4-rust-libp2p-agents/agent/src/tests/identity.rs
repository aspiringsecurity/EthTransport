use alloy::primitives::address;

use crate::identity::{IdentityBinding, PeerRegistry};

// Test private key (Hardhat account #0 — never use with real funds)
const TEST_KEY: &str = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// Corresponding EOA for the test key
const TEST_EOA: alloy::primitives::Address = address!("f39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

#[tokio::test]
async fn attestation_roundtrip() {
    let peer_id = "12D3KooWTestPeerId123456789";
    let binding = IdentityBinding::create(TEST_KEY, peer_id)
        .await
        .expect("create attestation");

    assert_eq!(binding.peer_id, peer_id);
    assert_eq!(binding.eoa, TEST_EOA);
    assert!(!binding.signature.is_empty());

    // Verify the signature
    assert!(
        binding.verify().expect("verify"),
        "signature should be valid"
    );
}

#[tokio::test]
async fn attestation_from_parts_verifies() {
    let peer_id = "12D3KooWAnotherPeer";
    let binding = IdentityBinding::create(TEST_KEY, peer_id)
        .await
        .expect("create attestation");

    // Reconstruct from parts (as if deserialized from a gossipsub message)
    let reconstructed = IdentityBinding::from_parts(
        binding.peer_id.clone(),
        binding.eoa,
        binding.signature.clone(),
    );

    assert!(
        reconstructed.verify().expect("verify"),
        "reconstructed binding should verify"
    );
}

#[tokio::test]
async fn tampered_signature_rejected() {
    let peer_id = "12D3KooWTamperTest";
    let binding = IdentityBinding::create(TEST_KEY, peer_id)
        .await
        .expect("create attestation");

    // Tamper with the signature by flipping a byte
    let mut tampered_sig = alloy::hex::decode(&binding.signature).unwrap();
    tampered_sig[10] ^= 0xFF;
    let tampered_hex = alloy::hex::encode(&tampered_sig);

    let tampered = IdentityBinding::from_parts(peer_id.to_string(), TEST_EOA, tampered_hex);

    // Verification should either fail or return false
    match tampered.verify() {
        Ok(valid) => assert!(!valid, "tampered signature should not verify"),
        Err(_) => {} // Signature parsing error is also acceptable
    }
}

#[tokio::test]
async fn wrong_peer_id_rejected() {
    let peer_id = "12D3KooWOriginalPeer";
    let binding = IdentityBinding::create(TEST_KEY, peer_id)
        .await
        .expect("create attestation");

    // Use the valid signature but claim a different PeerId
    let wrong_peer = IdentityBinding::from_parts(
        "12D3KooWDifferentPeer".to_string(),
        binding.eoa,
        binding.signature,
    );

    match wrong_peer.verify() {
        Ok(valid) => assert!(!valid, "wrong peer_id should not verify"),
        Err(_) => {} // Recovery error is also acceptable
    }
}

#[tokio::test]
async fn peer_registry_operations() {
    let mut registry = PeerRegistry::new();
    assert!(registry.all().is_empty());

    let binding = IdentityBinding::create(TEST_KEY, "12D3KooWPeer1")
        .await
        .expect("create attestation");

    registry.register(binding.clone());

    assert_eq!(registry.all().len(), 1);
    let retrieved = registry.get("12D3KooWPeer1").expect("peer should exist");
    assert_eq!(retrieved.eoa, TEST_EOA);
    assert_eq!(retrieved.peer_id, "12D3KooWPeer1");

    // Non-existent peer
    assert!(registry.get("12D3KooWNonExistent").is_none());
}

#[test]
fn identity_attestation_message_serialization() {
    use crate::network::AgentMessage;

    let msg = AgentMessage::IdentityAttestation {
        peer_id: "12D3KooWTestPeer".to_string(),
        eoa: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".to_string(),
        signature: "deadbeef".to_string(),
    };

    let json = serde_json::to_string(&msg).expect("serialize");
    let deserialized: AgentMessage = serde_json::from_str(&json).expect("deserialize");

    match deserialized {
        AgentMessage::IdentityAttestation {
            peer_id,
            eoa,
            signature,
        } => {
            assert_eq!(peer_id, "12D3KooWTestPeer");
            assert_eq!(eoa, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
            assert_eq!(signature, "deadbeef");
        }
        _ => panic!("expected IdentityAttestation variant"),
    }
}
