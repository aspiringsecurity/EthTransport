use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::time::Duration;

use anyhow::Result;
use libp2p::swarm::NetworkBehaviour;
use libp2p::{gossipsub, mdns, noise, tcp, yamux, Swarm, SwarmBuilder};
use serde::{Deserialize, Serialize};

pub const TOPIC: &str = "v4-swap-agents";
pub const INTENT_TOPIC: &str = "v4-swap-intents";

#[derive(NetworkBehaviour)]
pub struct AgentBehaviour {
    pub gossipsub: gossipsub::Behaviour,
    pub mdns: mdns::tokio::Behaviour,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AgentMessage {
    Chat {
        content: String,
    },
    SwapExecuted {
        agent: String,
        direction: String,
        amount: String,
        tx_hash: String,
    },
    SwapRequest {
        direction: String,
        amount: String,
    },
    /// PeerId <-> EOA identity attestation (EIP-191 signed proof of Ethereum address ownership)
    IdentityAttestation {
        peer_id: String,
        eoa: String,
        signature: String,
    },
    /// Swap intent broadcast — signals intent to swap before execution
    SwapIntent {
        agent: String,
        direction: String,
        amount: String,
        min_price: Option<String>,
        max_price: Option<String>,
        /// Maximum acceptable slippage in basis points (100 bps = 1%).
        /// Signals to peers how sensitive this agent is to adverse execution.
        #[serde(default)]
        max_slippage_bps: Option<u64>,
        timestamp: u64,
    },
    /// Coordinated swap proposal — seeking a counterparty
    SwapProposal {
        proposal_id: String,
        initiator: String,
        direction: String,
        amount: String,
        desired_direction: String,
        desired_amount: String,
        min_reputation: Option<f64>,
        expires_at: u64,
    },
    /// Accept a coordinated swap proposal
    SwapAcceptance {
        proposal_id: String,
        acceptor: String,
    },
    /// Signal that one side has executed their swap on-chain
    SwapFill {
        proposal_id: String,
        executor: String,
        tx_hash: String,
    },
    /// Request a quote from peers for a swap
    QuoteRequest {
        quote_id: String,
        requester: String,
        direction: String,
        amount: String,
        min_reputation: Option<f64>,
        expires_at: u64,
    },
    /// Respond to a quote request with terms
    QuoteResponse {
        response_id: String,
        quote_id: String,
        responder: String,
        offered_amount: String,
        price: String,
        expires_at: u64,
    },
    /// Accept a specific quote response (triggers execution)
    QuoteAccept {
        quote_id: String,
        response_id: String,
        acceptor: String,
    },
    /// MEV alert — broadcast when a swap's realized slippage exceeds the sandwich threshold.
    /// Peers use this to build a network-wide picture of execution quality.
    MevAlert {
        /// PeerId of the agent reporting the event.
        reporter: String,
        /// Swap direction (e.g. "TKNA -> TKNB").
        direction: String,
        /// Input amount (human-readable, e.g. "100").
        amount_in: String,
        /// amountOutMin enforced on-chain (wei, as decimal string).
        amount_out_min: String,
        /// Actual output received (wei, as decimal string).
        actual_out: String,
        /// Realized slippage in basis points.
        realized_slippage_bps: u64,
        /// True if slippage exceeded the sandwich detection threshold.
        sandwich_detected: bool,
        timestamp: u64,
    },
}

/// Build gossipsub peer scoring parameters tuned for swap agent network.
/// Returns params and thresholds for use with `Behaviour::with_peer_score`.
pub fn build_peer_score_params() -> (gossipsub::PeerScoreParams, gossipsub::PeerScoreThresholds) {
    let mut params = gossipsub::PeerScoreParams::default();

    let topic_params = gossipsub::TopicScoreParams {
        topic_weight: 1.0,
        // P1: reward time in mesh
        time_in_mesh_weight: 0.5,
        time_in_mesh_quantum: Duration::from_secs(1),
        time_in_mesh_cap: 100.0,
        // P2: reward first message deliveries
        first_message_deliveries_weight: 1.0,
        first_message_deliveries_decay: 0.97,
        first_message_deliveries_cap: 100.0,
        // P3: disabled — too aggressive for small demo networks (<10 peers)
        mesh_message_deliveries_weight: 0.0,
        // P4: penalize invalid/malformed messages
        invalid_message_deliveries_weight: -10.0,
        invalid_message_deliveries_decay: 0.9,
        ..Default::default()
    };

    let swap_topic_hash = gossipsub::IdentTopic::new(TOPIC).hash();
    let intent_topic_hash = gossipsub::IdentTopic::new(INTENT_TOPIC).hash();
    params.topics.insert(swap_topic_hash, topic_params.clone());
    params.topics.insert(intent_topic_hash, topic_params);

    // P5: application-specific score weight (fed by ReputationStore)
    params.app_specific_weight = 10.0;

    // P7: penalize protocol-level misbehavior (re-graft before backoff, IWANT timeout)
    params.behaviour_penalty_weight = -1.0;
    params.behaviour_penalty_threshold = 1.0;
    params.behaviour_penalty_decay = 0.9;

    // Lenient thresholds for a demo network
    let thresholds = gossipsub::PeerScoreThresholds {
        gossip_threshold: -100.0,
        publish_threshold: -200.0,
        graylist_threshold: -400.0,
        accept_px_threshold: 0.0,
        opportunistic_graft_threshold: 5.0,
    };

    (params, thresholds)
}

pub fn build_swarm() -> Result<Swarm<AgentBehaviour>> {
    let swarm = SwarmBuilder::with_new_identity()
        .with_tokio()
        .with_tcp(
            tcp::Config::default(),
            noise::Config::new,
            yamux::Config::default,
        )?
        .with_quic()
        .with_behaviour(|key| {
            let message_id_fn = |message: &gossipsub::Message| {
                let mut s = DefaultHasher::new();
                message.data.hash(&mut s);
                gossipsub::MessageId::from(s.finish().to_string())
            };

            let gossipsub_config = gossipsub::ConfigBuilder::default()
                .heartbeat_interval(Duration::from_secs(10))
                .validation_mode(gossipsub::ValidationMode::Strict)
                .message_id_fn(message_id_fn)
                .validate_messages()
                .build()
                .map_err(std::io::Error::other)?;

            let gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            )
            .map_err(std::io::Error::other)?;

            let mdns =
                mdns::tokio::Behaviour::new(mdns::Config::default(), key.public().to_peer_id())?;

            Ok(AgentBehaviour { gossipsub, mdns })
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(600)))
        .build();

    Ok(swarm)
}
