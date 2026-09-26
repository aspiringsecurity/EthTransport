use crate::network::{build_peer_score_params, AgentMessage, INTENT_TOPIC, TOPIC};

#[test]
fn topic_constant() {
    assert_eq!(TOPIC, "v4-swap-agents");
}

#[test]
fn chat_message_roundtrip() {
    let msg = AgentMessage::Chat {
        content: "hello".into(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::Chat { content } => assert_eq!(content, "hello"),
        _ => panic!("wrong variant"),
    }
}

#[test]
fn swap_executed_roundtrip() {
    let msg = AgentMessage::SwapExecuted {
        agent: "peer1".into(),
        direction: "A→B".into(),
        amount: "100".into(),
        tx_hash: "0xabc".into(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::SwapExecuted {
            agent,
            direction,
            amount,
            tx_hash,
        } => {
            assert_eq!(agent, "peer1");
            assert_eq!(direction, "A→B");
            assert_eq!(amount, "100");
            assert_eq!(tx_hash, "0xabc");
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn swap_request_roundtrip() {
    let msg = AgentMessage::SwapRequest {
        direction: "B→A".into(),
        amount: "50".into(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::SwapRequest { direction, amount } => {
            assert_eq!(direction, "B→A");
            assert_eq!(amount, "50");
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn serialized_json_has_type_tag() {
    let chat = serde_json::to_value(&AgentMessage::Chat {
        content: "hi".into(),
    })
    .unwrap();
    assert_eq!(chat["type"], "Chat");

    let exec = serde_json::to_value(&AgentMessage::SwapExecuted {
        agent: "a".into(),
        direction: "d".into(),
        amount: "1".into(),
        tx_hash: "0x".into(),
    })
    .unwrap();
    assert_eq!(exec["type"], "SwapExecuted");

    let req = serde_json::to_value(&AgentMessage::SwapRequest {
        direction: "d".into(),
        amount: "1".into(),
    })
    .unwrap();
    assert_eq!(req["type"], "SwapRequest");
}

#[test]
fn intent_topic_constant() {
    assert_eq!(INTENT_TOPIC, "v4-swap-intents");
}

#[test]
fn swap_intent_roundtrip() {
    let msg = AgentMessage::SwapIntent {
        agent: "peer1".into(),
        direction: "TKNA -> TKNB".into(),
        amount: "10".into(),
        min_price: Some("0.95".into()),
        max_price: Some("1.05".into()),
        max_slippage_bps: None,
        timestamp: 1700000000,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::SwapIntent {
            agent,
            direction,
            amount,
            min_price,
            max_price,
            timestamp,
            ..
        } => {
            assert_eq!(agent, "peer1");
            assert_eq!(direction, "TKNA -> TKNB");
            assert_eq!(amount, "10");
            assert_eq!(min_price, Some("0.95".into()));
            assert_eq!(max_price, Some("1.05".into()));
            assert_eq!(timestamp, 1700000000);
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn swap_intent_optional_prices_none() {
    let msg = AgentMessage::SwapIntent {
        agent: "peer2".into(),
        direction: "TKNB -> TKNA".into(),
        amount: "5".into(),
        min_price: None,
        max_price: None,
        max_slippage_bps: None,
        timestamp: 1700000001,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::SwapIntent {
            min_price,
            max_price,
            ..
        } => {
            assert!(min_price.is_none());
            assert!(max_price.is_none());
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn swap_intent_serialized_json_has_type_tag() {
    let intent = serde_json::to_value(&AgentMessage::SwapIntent {
        agent: "a".into(),
        direction: "d".into(),
        amount: "1".into(),
        min_price: None,
        max_price: None,
        max_slippage_bps: None,
        timestamp: 0,
    })
    .unwrap();
    assert_eq!(intent["type"], "SwapIntent");
}

// --- Quote message roundtrip tests ---

#[test]
fn quote_request_roundtrip() {
    let msg = AgentMessage::QuoteRequest {
        quote_id: "quote_abc_123".into(),
        requester: "peer1".into(),
        direction: "TKNA -> TKNB".into(),
        amount: "100".into(),
        min_reputation: Some(0.5),
        expires_at: 1700000000,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::QuoteRequest {
            quote_id,
            requester,
            direction,
            amount,
            min_reputation,
            expires_at,
        } => {
            assert_eq!(quote_id, "quote_abc_123");
            assert_eq!(requester, "peer1");
            assert_eq!(direction, "TKNA -> TKNB");
            assert_eq!(amount, "100");
            assert_eq!(min_reputation, Some(0.5));
            assert_eq!(expires_at, 1700000000);
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn quote_request_optional_min_reputation_none() {
    let msg = AgentMessage::QuoteRequest {
        quote_id: "q1".into(),
        requester: "peer1".into(),
        direction: "TKNA -> TKNB".into(),
        amount: "50".into(),
        min_reputation: None,
        expires_at: 1700000000,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::QuoteRequest { min_reputation, .. } => {
            assert!(min_reputation.is_none());
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn quote_response_roundtrip() {
    let msg = AgentMessage::QuoteResponse {
        response_id: "resp_xyz_456".into(),
        quote_id: "quote_abc_123".into(),
        responder: "peer2".into(),
        offered_amount: "98".into(),
        price: "0.98".into(),
        expires_at: 1700000030,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::QuoteResponse {
            response_id,
            quote_id,
            responder,
            offered_amount,
            price,
            expires_at,
        } => {
            assert_eq!(response_id, "resp_xyz_456");
            assert_eq!(quote_id, "quote_abc_123");
            assert_eq!(responder, "peer2");
            assert_eq!(offered_amount, "98");
            assert_eq!(price, "0.98");
            assert_eq!(expires_at, 1700000030);
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn quote_accept_roundtrip() {
    let msg = AgentMessage::QuoteAccept {
        quote_id: "quote_abc_123".into(),
        response_id: "resp_xyz_456".into(),
        acceptor: "peer1".into(),
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::QuoteAccept {
            quote_id,
            response_id,
            acceptor,
        } => {
            assert_eq!(quote_id, "quote_abc_123");
            assert_eq!(response_id, "resp_xyz_456");
            assert_eq!(acceptor, "peer1");
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn quote_messages_serialized_json_has_type_tags() {
    let qr = serde_json::to_value(&AgentMessage::QuoteRequest {
        quote_id: "q".into(),
        requester: "p".into(),
        direction: "d".into(),
        amount: "1".into(),
        min_reputation: None,
        expires_at: 0,
    })
    .unwrap();
    assert_eq!(qr["type"], "QuoteRequest");

    let qresp = serde_json::to_value(&AgentMessage::QuoteResponse {
        response_id: "r".into(),
        quote_id: "q".into(),
        responder: "p".into(),
        offered_amount: "1".into(),
        price: "1".into(),
        expires_at: 0,
    })
    .unwrap();
    assert_eq!(qresp["type"], "QuoteResponse");

    let qa = serde_json::to_value(&AgentMessage::QuoteAccept {
        quote_id: "q".into(),
        response_id: "r".into(),
        acceptor: "p".into(),
    })
    .unwrap();
    assert_eq!(qa["type"], "QuoteAccept");
}

// --- Peer score parameter tests ---

#[test]
fn p4_invalid_message_weight_is_negative() {
    let (params, _) = build_peer_score_params();
    let swap_topic_hash = libp2p::gossipsub::IdentTopic::new(TOPIC).hash();
    let topic_params = params
        .topics
        .get(&swap_topic_hash)
        .expect("swap topic should exist");
    assert!(
        topic_params.invalid_message_deliveries_weight < 0.0,
        "P4 weight should be negative to penalize invalid messages"
    );
}

#[test]
fn p7_behaviour_penalty_configured() {
    let (params, _) = build_peer_score_params();
    assert!(
        params.behaviour_penalty_weight < 0.0,
        "P7 behaviour penalty weight should be negative"
    );
    assert!(
        params.behaviour_penalty_decay > 0.0 && params.behaviour_penalty_decay < 1.0,
        "P7 decay should be between 0 and 1"
    );
}

#[test]
fn p3_remains_disabled() {
    let (params, _) = build_peer_score_params();
    let swap_topic_hash = libp2p::gossipsub::IdentTopic::new(TOPIC).hash();
    let topic_params = params.topics.get(&swap_topic_hash).unwrap();
    assert_eq!(
        topic_params.mesh_message_deliveries_weight, 0.0,
        "P3 should remain disabled for small networks"
    );
}

#[test]
fn p5_weight_is_positive() {
    let (params, _) = build_peer_score_params();
    assert!(params.app_specific_weight > 0.0);
}

#[test]
fn both_topics_have_score_params() {
    let (params, _) = build_peer_score_params();
    let swap_topic = libp2p::gossipsub::IdentTopic::new(TOPIC).hash();
    let intent_topic = libp2p::gossipsub::IdentTopic::new(INTENT_TOPIC).hash();
    assert!(params.topics.contains_key(&swap_topic));
    assert!(params.topics.contains_key(&intent_topic));
}

#[test]
fn thresholds_are_ordered() {
    let (_, thresholds) = build_peer_score_params();
    assert!(thresholds.gossip_threshold > thresholds.publish_threshold);
    assert!(thresholds.publish_threshold > thresholds.graylist_threshold);
}

#[test]
fn swap_intent_with_slippage_roundtrip() {
    let msg = AgentMessage::SwapIntent {
        agent: "peer1".into(),
        direction: "TKNA -> TKNB".into(),
        amount: "100".into(),
        min_price: None,
        max_price: None,
        max_slippage_bps: Some(50),
        timestamp: 1_000_000,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::SwapIntent {
            max_slippage_bps,
            timestamp,
            ..
        } => {
            assert_eq!(max_slippage_bps, Some(50));
            assert_eq!(timestamp, 1_000_000);
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn swap_intent_without_slippage_deserializes_as_none() {
    // Old-format SwapIntent (no max_slippage_bps field) must still deserialize cleanly.
    let json = r#"{"type":"SwapIntent","agent":"p1","direction":"TKNA -> TKNB","amount":"10","timestamp":0}"#;
    let decoded: AgentMessage = serde_json::from_str(json).unwrap();
    match decoded {
        AgentMessage::SwapIntent {
            max_slippage_bps, ..
        } => assert_eq!(max_slippage_bps, None),
        _ => panic!("wrong variant"),
    }
}

#[test]
fn mev_alert_roundtrip() {
    let msg = AgentMessage::MevAlert {
        reporter: "peer1".into(),
        direction: "TKNA -> TKNB".into(),
        amount_in: "100".into(),
        amount_out_min: "99500000000000000000".into(),
        actual_out: "97000000000000000000".into(),
        realized_slippage_bps: 301,
        sandwich_detected: true,
        timestamp: 9_999,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::MevAlert {
            reporter,
            direction,
            realized_slippage_bps,
            sandwich_detected,
            timestamp,
            ..
        } => {
            assert_eq!(reporter, "peer1");
            assert_eq!(direction, "TKNA -> TKNB");
            assert_eq!(realized_slippage_bps, 301);
            assert!(sandwich_detected);
            assert_eq!(timestamp, 9_999);
        }
        _ => panic!("wrong variant"),
    }
}

#[test]
fn mev_alert_sandwich_false_roundtrip() {
    let msg = AgentMessage::MevAlert {
        reporter: "peer2".into(),
        direction: "TKNB -> TKNA".into(),
        amount_in: "50".into(),
        amount_out_min: "49750000000000000000".into(),
        actual_out: "49800000000000000000".into(),
        realized_slippage_bps: 40,
        sandwich_detected: false,
        timestamp: 1,
    };
    let json = serde_json::to_string(&msg).unwrap();
    let decoded: AgentMessage = serde_json::from_str(&json).unwrap();
    match decoded {
        AgentMessage::MevAlert {
            sandwich_detected,
            realized_slippage_bps,
            ..
        } => {
            assert!(!sandwich_detected);
            assert_eq!(realized_slippage_bps, 40);
        }
        _ => panic!("wrong variant"),
    }
}
