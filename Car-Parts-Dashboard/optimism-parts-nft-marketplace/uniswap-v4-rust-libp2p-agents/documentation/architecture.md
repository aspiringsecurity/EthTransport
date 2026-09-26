# Architecture Diagrams

## 1. System Layer Architecture

```mermaid
graph TB
    subgraph APP["Application Layer"]
        CLI["CLI Commands"]
        REP["Reputation Store"]
        COORD["Coordination Book"]
        ARCH["Archival"]
    end

    subgraph TRUST["Trust Layer"]
        ID["Identity Binding"]
        SCORE["Composite Scoring"]
        GATE["Trust-Gated Execution"]
    end

    subgraph NET["Networking Layer - rust-libp2p 0.54"]
        GS["Gossipsub + mDNS"]
        PS["Peer Scoring P4/P5/P7"]
        HTTP["HTTP Client"]
    end

    subgraph EXEC["Execution Layer"]
        ETH["Ethereum Sepolia/Anvil\nUniswap V4 Hooks"]
        FIL["Filecoin Calibration\nSynapse SDK Sidecar"]
    end

    CLI --> ID
    CLI --> SCORE
    REP --> SCORE
    COORD --> GATE

    ID --> GS
    SCORE --> PS
    GATE --> GS
    ARCH --> HTTP

    GS --> ETH
    HTTP --> FIL
```

---

## 2. Trust Primitive Stack

```mermaid
graph BT
    A["Identity Binding\nEIP-191 personal_sign\nPeerId to Ethereum EOA"]
    B["Gossipsub Peer Scoring\nP4: Invalid msgs, P5: App score, P7: Behaviour"]
    C["Composite Reputation\nBase Score minus Penalties\nFinal Score 0.0 to 1.0"]
    D["Trust Level Mapping\nUnknown / Low / Medium / High / Trusted"]
    E["Coordination Gate\nUnknown peers blocked\nmin-rep threshold enforced"]

    A --> B
    B --> C
    C --> D
    D --> E
```

---

## 3. Reputation Scoring Pipeline

```mermaid
graph TD
    SWAP["SwapExecuted msgs"] --> F1["Swap Factor\nweight 0.40"]
    SWAP --> F3["Follow-Through\nweight 0.25"]
    INTENT["SwapIntent msgs"] --> F3
    IDENT["Identity Attestation"] --> F2["Identity Factor\nweight 0.20"]
    SWAP --> F4["Recency Factor\nweight 0.15"]

    F1 --> BASESUM["Base Score"]
    F2 --> BASESUM
    F3 --> BASESUM
    F4 --> BASESUM

    INV["Invalid msgs x 0.05"] --> PCAP["Penalty\ncapped at 0.50"]
    UNF["Unfollowed intents x 0.03"] --> PCAP
    EXP["Expired proposals x 0.02"] --> PCAP

    BASESUM --> FINAL["Final Score\nbase minus penalty\nRange 0.0 to 1.0"]
    PCAP --> FINAL

    FINAL --> TRUST["Trust Level"]
    FINAL --> P5["Gossipsub P5\nrefreshed every 30s"]
```

---

## 4. Gossipsub Peer Scoring

```mermaid
graph TD
    MSG["Incoming Message"] --> PARSE{"Valid JSON?"}
    PARSE -->|Yes| ACCEPT["Accept"]
    PARSE -->|No| REJECT["Reject"]

    REJECT --> P4["P4: -10.0 penalty"]
    REJECT --> REPPEN["-0.05 reputation"]

    TIMER["30s Timer"] --> REFRESH["Refresh P5 scores"]
    TIMER --> CLEANUP["Cleanup expired + stale"]

    ACCEPT --> ENGINE["Scoring Engine"]
    P4 --> ENGINE
    REFRESH --> ENGINE

    ENGINE --> TH{"Threshold Check"}
    TH -->|"Above -100"| GOSSIP["Can gossip"]
    TH -->|"Above -200"| PUBLISH["Can publish"]
    TH -->|"Below -400"| GRAY["Graylisted"]
```

---

## 5. Coordination Protocol State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: propose command
    Pending --> TrustCheck: SwapProposal broadcast
    TrustCheck --> Ignored: Initiator is Unknown
    TrustCheck --> RepCheck: Initiator known
    RepCheck --> Skipped: Score below min_reputation
    RepCheck --> Accepted: accept command
    Accepted --> InitiatorExecuted: Initiator swaps on-chain
    InitiatorExecuted --> Completed: Counterparty swaps on-chain
    Pending --> Expired: 30s timeout
```

---

## 6. Message Types and Topics

```mermaid
graph LR
    subgraph T1["v4-swap-agents topic"]
        CHAT["Chat"]
        SWAPEX["SwapExecuted"]
        IDATT["IdentityAttestation"]
        PROPOSAL["SwapProposal"]
        ACCEPTANCE["SwapAcceptance"]
        FILL["SwapFill"]
    end

    subgraph T2["v4-swap-intents topic"]
        SINTENT["SwapIntent"]
    end

    A["Agent A"] -->|publishes| T1
    A -->|publishes| T2
    T1 -->|subscribes| B["Agent B"]
    T2 -->|subscribes| B
```

---

## 7. Execution Mode Pipeline

```mermaid
graph TD
    CMD["swap 100"] --> INTENT["Broadcast SwapIntent"]
    INTENT --> FLUSH["500ms flush"]
    FLUSH --> CHECK{"Execution Mode?"}

    CHECK -->|LIVE| SEPOLIA["RPC to Sepolia"]
    CHECK -->|LOCAL| ANVIL["RPC to Anvil"]
    CHECK -->|SIMULATE| SIM["Synthetic tx hash"]

    SEPOLIA --> BROADCAST["Broadcast SwapExecuted"]
    ANVIL --> BROADCAST
    SIM --> BROADCAST

    BROADCAST --> REP["Update reputation"]
    BROADCAST --> LOG["Buffer log entry"]
    LOG -->|archive cmd| FIL["Flush to Filecoin"]
```

---

## 8. Module Dependency Graph

```mermaid
graph TD
    MAIN["main.rs\n~1100 LOC"] --> CLI["cli.rs\n20 LOC"]
    MAIN --> NET["network.rs\n155 LOC"]
    MAIN --> SIM["sim.rs\n50 LOC"]
    MAIN --> UNI["uniswap.rs\n200 LOC"]
    MAIN --> ARCH["archival.rs\n160 LOC"]
    MAIN --> ID["identity.rs\n115 LOC"]
    MAIN --> REP["reputation.rs\n350 LOC"]
    MAIN --> COORD["coordination.rs\n160 LOC"]

    REP -.-> ID
    COORD -.-> REP
```

---

## 9. Identity Binding Flow

```mermaid
sequenceDiagram
    participant Agent
    participant GS as Gossipsub
    participant Peer

    Note over Agent: Startup
    Agent->>Agent: Load PRIVATE_KEY
    Agent->>Agent: Generate PeerId
    Agent->>Agent: EIP-191 Sign identity msg
    Agent->>Agent: Store IdentityBinding

    Note over Agent,Peer: On ConnectionEstablished
    Agent->>GS: Publish IdentityAttestation
    GS->>Peer: Deliver attestation

    Note over Peer: Verification
    Peer->>Peer: recover_address_from_msg

    alt Valid signature
        Peer->>Peer: Register in PeerRegistry
        Peer->>Peer: set_identity_verified true
    else Invalid signature
        Peer->>Peer: Log warning
    end
```

---

## 10. End-to-End Swap Flow

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant GS as Gossipsub
    participant Peers
    participant ETH as Uniswap V4
    participant FIL as Filecoin

    User->>Agent: swap 100
    Agent->>GS: SwapIntent
    GS->>Peers: INTENT broadcast

    Note over Agent: 500ms flush

    Agent->>ETH: SwapRouter.swap
    ETH-->>Agent: tx_hash

    Agent->>GS: SwapExecuted
    GS->>Peers: SWAP broadcast

    Agent->>Agent: Update reputation
    Agent->>Agent: Buffer log entry

    User->>Agent: archive
    Agent->>FIL: POST /upload
    FIL-->>Agent: PieceCID
```

---

## 11. Two-Agent Coordination Flow

```mermaid
sequenceDiagram
    participant A as Initiator
    participant GS as Gossipsub
    participant B as Counterparty

    Note over A: propose 100 a2b 50 b2a

    A->>GS: SwapProposal
    GS->>B: Receive proposal

    Note over B: Trust + rep check

    B->>GS: SwapAcceptance
    GS->>A: Receive acceptance

    A->>A: Execute swap on-chain
    A->>GS: SwapFill tx_hash_a
    GS->>B: Receive fill

    B->>B: Execute counter-swap
    B->>GS: SwapFill tx_hash_b
    GS->>A: Receive fill

    Note over A,B: Completed
```

---

## 12. Periodic Score Refresh Cycle

```mermaid
graph TD
    TIMER["30s Timer"] --> SCORES["Feed P5 scores\ncomposite x 100"]
    TIMER --> EXPIRED["Cleanup expired proposals\npenalize initiators -0.02"]
    TIMER --> STALE["Remove stale peers\ninactive over 7 days"]

    SCORES --> DONE["Wait 30s"]
    EXPIRED --> DONE
    STALE --> DONE
    DONE --> TIMER
```
