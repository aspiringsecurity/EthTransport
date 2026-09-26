use alloy::hex;
use alloy::primitives::Address;
use alloy::signers::local::PrivateKeySigner;
use alloy::signers::Signer;
use anyhow::Result;
use std::collections::HashMap;

/// Message prefix for identity attestation signing.
/// Format: "libp2p-v4-swap-agents:identity:{peer_id}"
const ATTESTATION_PREFIX: &str = "libp2p-v4-swap-agents:identity:";

/// Cryptographic binding between a libp2p PeerId and an Ethereum EOA.
/// The agent signs a message containing their PeerId with their Ethereum private key,
/// proving they control both identities.
#[derive(Debug, Clone)]
pub struct IdentityBinding {
    pub peer_id: String,
    pub eoa: Address,
    /// Hex-encoded 65-byte EIP-191 signature (r || s || v)
    pub signature: String,
}

impl IdentityBinding {
    /// Create a signed attestation linking a PeerId to an EOA.
    /// Uses EIP-191 personal_sign to sign the message "libp2p-v4-swap-agents:identity:{peer_id}".
    pub async fn create(private_key: &str, peer_id: &str) -> Result<Self> {
        let signer: PrivateKeySigner = private_key.parse()?;
        let eoa = signer.address();
        let message = format!("{ATTESTATION_PREFIX}{peer_id}");
        let sig = signer.sign_message(message.as_bytes()).await?;
        let sig_hex = hex::encode(sig.as_bytes());

        Ok(Self {
            peer_id: peer_id.to_string(),
            eoa,
            signature: sig_hex,
        })
    }

    /// Construct an IdentityBinding from its parts (used when deserializing from a peer message).
    pub fn from_parts(peer_id: String, eoa: Address, signature: String) -> Self {
        Self {
            peer_id,
            eoa,
            signature,
        }
    }

    /// Verify that the signature was produced by the claimed EOA.
    /// Recovers the signer address from the EIP-191 signature and compares with the claimed EOA.
    pub fn verify(&self) -> Result<bool> {
        let message = format!("{ATTESTATION_PREFIX}{}", self.peer_id);
        let sig_bytes = hex::decode(&self.signature)?;
        let sig = alloy::primitives::PrimitiveSignature::try_from(sig_bytes.as_slice())?;
        let recovered = sig.recover_address_from_msg(message.as_bytes())?;
        Ok(recovered == self.eoa)
    }
}

/// Registry mapping PeerIds to verified IdentityBindings.
pub struct PeerRegistry {
    bindings: HashMap<String, IdentityBinding>,
}

impl PeerRegistry {
    pub fn new() -> Self {
        Self {
            bindings: HashMap::new(),
        }
    }

    /// Register a verified identity binding for a peer.
    pub fn register(&mut self, binding: IdentityBinding) {
        self.bindings.insert(binding.peer_id.clone(), binding);
    }

    /// Look up the identity binding for a peer.
    pub fn get(&self, peer_id: &str) -> Option<&IdentityBinding> {
        self.bindings.get(peer_id)
    }

    /// Get all registered identity bindings.
    pub fn all(&self) -> &HashMap<String, IdentityBinding> {
        &self.bindings
    }
}
