# Uniswap Developer Feedback

## ETHGlobal Hackathon — Uniswap Integration

This document provides the verification and developer feedback requested for our ETHGlobal hackathon submission and demonstrates our concrete use of Uniswap infrastructure across both **live Uniswap liquidity on Arbitrum mainnet** and **Uniswap V4 experimentation on Sepolia**. We have also launched PPT token on Arbitrum at Uniswap: please visit https://app.uniswap.org/positions/v3/arbitrum/5712703 and https://arbiscan.io/address/0x6f0f27926136e23c5e964c60fa79222b8c858d0e#code

Our implementation combines:

* Uniswap V3 liquidity on Arbitrum mainnet
* Uniswap V4 on Sepolia
* A custom Uniswap V4 hook
* Per-agent swap activity tracking
* Verifiable on-chain events
* ENS-based agent identity
* World ID human verification
* Agent-aware transaction and reputation infrastructure


The core architecture is:

```text
Human
  ↓
World ID Human Verification
  ↓
Agent Authorization / Identity
  ↓
ENS Agent Identity
  ↓
Uniswap V4 Swap
  ↓
Custom V4 Hook
  ↓
Per-Agent On-Chain Event
  ↓
Behavior / Reputation Data
  ↓
Coordination Between Autonomous Agents
```

---

# 1. Qualification Summary

Our project qualifies through a concrete, working integration with Uniswap infrastructure.

We have deployed the **PPT token on Arbitrum mainnet** and created a live Uniswap liquidity position:

**Uniswap V3 Arbitrum Position**

https://app.uniswap.org/positions/v3/arbitrum/5712703

This demonstrates that the project is not limited to a conceptual or mock integration: the token has been deployed to a live network and liquidity has been provided through Uniswap.

For the hackathon implementation, we additionally use **Uniswap V4 on Sepolia** with a custom hook that observes swap execution and records per-agent activity through verifiable on-chain events.

The V4 implementation therefore extends beyond a conventional swap interface.

Instead of treating Uniswap solely as an exchange layer, we use the V4 hook architecture as an **on-chain observability and coordination primitive for identity-aware autonomous agents**.

---

# 2. What We Built

The project connects four components:

### 2.1 Human verification

A human user is verified through **World ID**.

This provides the human authorization layer required before an agent can participate in the system.

### 2.2 Agent identity

The agent is associated with an **ENS identity**, allowing the autonomous actor to have a persistent, human-readable identity rather than relying only on an address.

### 2.3 Uniswap execution

The agent executes swaps through **Uniswap V4 on Sepolia**.

The swap is routed through a pool configured with our custom hook.

### 2.4 Hook-based observability

Our custom V4 hook observes the swap and emits an on-chain event containing information necessary to associate the execution with the participating agent.

This creates an auditable relationship between:

```text
Agent Identity
      ↓
Swap Execution
      ↓
Hook Execution
      ↓
On-chain Event
```

The resulting events can subsequently be consumed by reputation, analytics, coordination, or autonomous-agent infrastructure.

---

# 3. Why Uniswap V4 Is Important to Our Architecture

A conventional Uniswap integration would typically use Uniswap as a liquidity and swap execution layer:

```text
Application → Uniswap → Token Swap
```

Our implementation explores a different model:

```text
Application
    ↓
Agent Identity
    ↓
Uniswap V4
    ↓
Custom Hook
    ↓
Observable Agent Behavior
    ↓
Reputation / Coordination
```

The key feature we are exploring is the ability to attach application-specific logic to the lifecycle of a Uniswap V4 pool.

For autonomous agents, this creates an interesting primitive:

> A decentralized exchange can become not only an execution venue, but also a source of verifiable behavioral signals.

Our hook records agent-associated swap activity so that downstream systems can reason about what an agent actually did on-chain.

This is particularly useful for systems where autonomous agents need to interact economically while maintaining an auditable history of their actions.

---

# 4. Live Uniswap Infrastructure

## PPT Token — Arbitrum Mainnet

The PPT token has been deployed on Arbitrum mainnet and has a live Uniswap liquidity position.

### Uniswap Position

https://app.uniswap.org/positions/v3/arbitrum/5712703

This position provides independently verifiable evidence of the project's use of Uniswap liquidity infrastructure.

### Network

```text
Arbitrum One
```

### Integration

```text
PPT Token
    ↓
Uniswap V3
    ↓
Arbitrum Mainnet Liquidity Position
```

The mainnet deployment establishes the project's use of live Uniswap infrastructure independently of the experimental V4 implementation.

---

# 5. Uniswap V4 Sepolia Implementation

For the hackathon, we use Uniswap V4 on Sepolia to experiment with programmable pool behavior.

The implementation includes a custom hook responsible for observing swap activity and producing verifiable events.

### Network

```text
Ethereum Sepolia
```

### Uniswap Version

```text
Uniswap V4
```

### Custom Hook

**Contract:** `[INSERT V4 HOOK CONTRACT ADDRESS]`

**Explorer:** `[INSERT SEPOLIA EXPLORER URL]`

### Pool / Currency Configuration

**Pool ID:** `[INSERT POOL ID]`

**Currency 0:** `[INSERT ADDRESS]`

**Currency 1:** `[INSERT ADDRESS]`

---

# 6. Custom Hook

The central Uniswap-specific component of the hackathon implementation is our custom V4 hook.

The hook is designed to observe relevant swap lifecycle events and associate them with the agent responsible for the transaction.

Conceptually:

```solidity
swap()
  ↓
Uniswap V4 PoolManager
  ↓
Custom Hook
  ↓
Agent Activity Event
```

The hook provides an application-specific layer around Uniswap V4 execution without requiring the core Uniswap protocol to maintain application-level agent state.

This separation is important for experimentation with autonomous agents because identity, reputation, analytics, and coordination logic can remain outside the core AMM while still using verifiable events generated during pool interaction.

---

# 7. Agent Activity Tracking

Our implementation tracks swap activity at the agent level.

A simplified conceptual event is:

```solidity
event AgentSwap(
    address indexed agent,
    bytes32 indexed agentId,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
);
```

> The exact event signature should be verified against the deployed implementation before modifying this section.

The important property is that a swap can be associated with a specific agent identity and subsequently verified from blockchain data.

This allows downstream applications to build:

* Agent activity histories
* Reputation systems
* Economic behavior analytics
* Agent-to-agent coordination
* Risk monitoring
* Automated strategy evaluation
* Verifiable agent credentials

---

# 8. Identity Layer

The identity model combines two different concepts.

## Human Identity

World ID is used for human verification.

```text
Human
  ↓
World ID
```

This establishes that the system's initial authorization originates from a verified human.

## Agent Identity

ENS provides the agent-facing identity layer.

```text
Verified Human
      ↓
Authorized Agent
      ↓
ENS Identity
      ↓
Wallet / Execution Address
```

This allows an autonomous agent to have an identifiable representation while maintaining the decentralized execution model.

---

# 9. Complete Architecture

The complete architecture can be represented as:

```text
                         ┌──────────────────┐
                         │      Human       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     World ID     │
                         │ Human Verification│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Agent Identity  │
                         │      + ENS       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Uniswap V4     │
                         │      Swap        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Custom Hook    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ On-chain Agent   │
                         │ Activity Event   │
                         └────────┬─────────┘
                                  │
                                  ▼
                  ┌──────────────────────────────┐
                  │ Reputation / Analytics /     │
                  │ Autonomous Coordination     │
                  └──────────────────────────────┘
```

---

# 10. Repository

## Public GitHub Repository

**Repository:** `[INSERT PUBLIC GITHUB REPOSITORY URL]`

The repository contains the source code required to reproduce and inspect the Uniswap integration.

### Relevant directories

Please update the following paths to match the final repository structure:

```text
/contracts
  └── [V4 hook contract]

/scripts
  └── [deployment / setup scripts]

/test
  └── [hook tests]

/src
  └── [agent / frontend integration]
```

---

# 11. Important Code References

The README and this document should point reviewers directly to the Uniswap-specific implementation.

## V4 Hook

**File:**

`[INSERT PATH TO V4 HOOK]`

**Relevant functions:**

```text
[INSERT FUNCTION NAME]
[INSERT FUNCTION NAME]
```

These functions implement the hook logic that observes Uniswap V4 swap execution and records agent-related activity.

## Agent Identity

**File:**

`[INSERT PATH TO AGENT IDENTITY CONTRACT / MODULE]`

Relevant logic:

```text
[INSERT FUNCTION / CLASS / MODULE]
```

## ENS Integration

**File:**

`[INSERT PATH TO ENS INTEGRATION]`

Relevant logic:

```text
[INSERT FUNCTION / CLASS / MODULE]
```

## World ID Integration

**File:**

`[INSERT PATH TO WORLD ID INTEGRATION]`

Relevant logic:

```text
[INSERT FUNCTION / CLASS / MODULE]
```

## Uniswap V4 Pool Setup

**File:**

`[INSERT PATH TO V4 DEPLOYMENT / POOL CONFIGURATION]`

Relevant logic:

```text
[INSERT FUNCTION / SCRIPT]
```

---

# 12. Contract Addresses

For reproducibility and auditability, the following addresses should be maintained in this document.

| Component                 | Network          | Address                                                                    |
| ------------------------- | ---------------- | -------------------------------------------------------------------------- |
| PPT Token                 | Arbitrum Mainnet | `[INSERT ADDRESS]`                                                         |
| Uniswap V3 Position       | Arbitrum Mainnet | [Position #5712703](https://app.uniswap.org/positions/v3/arbitrum/5712703) |
| PPT / V4 Token            | Sepolia          | `[INSERT ADDRESS]`                                                         |
| V4 Hook                   | Sepolia          | `[INSERT ADDRESS]`                                                         |
| PoolManager               | Sepolia          | `[INSERT ADDRESS]`                                                         |
| Agent Contract / Registry | Sepolia          | `[INSERT ADDRESS]`                                                         |

---

# 13. Verification Steps for Reviewers

A reviewer can verify the integration using the following process.

### Step 1 — Verify the live Uniswap position

Open:

https://app.uniswap.org/positions/v3/arbitrum/5712703

Confirm that the position exists on Arbitrum and is associated with the project's deployed token/liquidity.

### Step 2 — Inspect the public repository

Open:

`[INSERT GITHUB URL]`

Locate the V4 hook implementation:

`[INSERT FILE PATH]`

### Step 3 — Verify the deployed V4 hook

Open:

`[INSERT SEPOLIA EXPLORER URL]`

Confirm that the contract is deployed on Sepolia.

### Step 4 — Inspect the hook logic

Review the relevant hook callbacks and event emission logic.

The implementation should demonstrate that the hook is connected to Uniswap V4 execution rather than merely emitting an unrelated application event.

### Step 5 — Verify a sample transaction

Sample transaction:

`[INSERT SEPOLIA TRANSACTION HASH]`

The transaction should demonstrate:

```text
Agent
  ↓
Uniswap V4
  ↓
Hook execution
  ↓
Agent activity event
```

### Step 6 — Verify emitted events

Sample event / transaction:

`[INSERT EVENT OR TRANSACTION URL]`

The event can be independently inspected using the Sepolia block explorer.

---

# 14. Testing

Our V4 implementation should be tested at multiple levels.

## Unit Tests

The hook tests cover:

* Hook deployment
* Hook permissions
* Swap execution
* Agent identification
* Event emission
* Expected event parameters
* Invalid/unregistered agent behavior where applicable

**Test location:**

`[INSERT TEST DIRECTORY]`

## Integration Testing

The integration tests verify that the application can:

1. Identify the agent.
2. Initiate a Uniswap V4 swap.
3. Execute the swap through the configured pool.
4. Trigger the custom hook.
5. Emit the agent activity event.
6. Read the resulting on-chain activity.

**Integration test location:**

`[INSERT PATH]`

---

# 15. What We Learned From Uniswap V4

The primary reason for using V4 rather than treating Uniswap as a conventional swap API was to explore the possibilities created by programmable hooks.

Our implementation highlighted several useful properties.

### Hooks enable application-specific execution context

Hooks provide a natural location for application-specific logic around pool activity.

This makes it possible to explore agent-aware execution without modifying the underlying AMM.

### On-chain events provide a verifiable activity layer

An agent can report what it did, but a hook-triggered blockchain event can provide an independently inspectable record of relevant execution.

This distinction is important for autonomous systems where other agents or applications may need to evaluate behavior.

### Identity and liquidity can remain separate

ENS and World ID do not need to become part of the AMM itself.

Instead:

```text
Identity Layer
      +
Execution Layer
      +
Observation Layer
```

can remain modular.

### V4 creates interesting possibilities for autonomous systems

The combination of programmable hooks and decentralized liquidity makes it possible to explore use cases such as:

* Agent-specific trading policies
* Agent reputation
* Economic coordination
* Automated treasury management
* Agent-to-agent settlement
* Behavior-based permissions
* Verifiable execution histories
* Autonomous market participation

Our implementation focuses specifically on the observability and reputation side of this design space.

---

# 16. Why This Is More Than a Standard Swap Integration

A standard integration might look like:

```text
User → Frontend → Uniswap → Swap
```

Our architecture instead uses Uniswap V4 as part of an agent execution and verification pipeline:

```text
Human
  ↓
World ID
  ↓
Agent Identity / ENS
  ↓
Uniswap V4
  ↓
Custom Hook
  ↓
Verifiable Agent Activity
  ↓
Reputation / Coordination
```

The key innovation we are exploring is therefore not simply swapping a token through Uniswap.

It is using **V4 hook execution as an observable, programmable boundary between decentralized liquidity and autonomous-agent behavior**.

---

# 17. Mainnet + V4 Combination

The project deliberately combines production-facing infrastructure with experimental V4 infrastructure.

### Arbitrum Mainnet

Our PPT token has a live Uniswap liquidity position:

https://app.uniswap.org/positions/v3/arbitrum/5712703

This demonstrates real deployment and liquidity usage.

### Sepolia

Our V4 implementation provides the experimentation environment for:

* Custom hooks
* Agent identity
* Swap observability
* On-chain activity events
* Agent reputation primitives

Together, these demonstrate both practical Uniswap usage and exploration of new capabilities enabled by V4.

---

# 18. Developer Feedback

## What worked well

The V4 hook architecture provides a powerful mechanism for extending pool interactions with application-specific logic while keeping the core application architecture modular.

The ability to execute custom logic around swap activity is particularly interesting for applications where a swap is part of a larger workflow rather than an isolated financial transaction.

For autonomous-agent applications, the hook model provides a useful boundary at which execution can be observed and additional verifiable information can be generated.

## Areas We Found Challenging

The main development challenge was understanding the exact lifecycle of V4 pool interactions and determining where application-specific logic should live.

For agent-based applications, another important consideration is how identity should be represented without coupling the identity system too tightly to the AMM.

We found it useful to keep:

* Human verification
* Agent identity
* Agent authorization
* Swap execution
* Event indexing
* Reputation

as separate modules.

## Suggestions / Feedback

For developers building with V4, clearer examples around identity-aware hooks and more complete reference implementations for non-trading use cases could make the learning curve easier.

Examples demonstrating patterns such as:

```text
Agent → Pool → Hook → Event → Off-chain Indexer
```

would be particularly useful for teams exploring autonomous agents, reputation systems, and application-specific coordination.

---

# 19. Future Work

The hackathon implementation is intended as a foundation for a broader agent coordination system.

Potential next steps include:

### Reputation

Aggregate verified swap activity into an agent reputation graph.

### Agent Credentials

Combine ENS identity, human verification, and on-chain behavioral history into portable agent credentials.

### Agent Coordination

Allow agents to discover and coordinate with other agents based on verifiable activity.

### Risk Controls

Use hook-level rules to enforce configurable constraints around autonomous trading.

### Analytics

Build dashboards showing agent-level liquidity participation and behavior.

### Cross-chain Agent Identity

Extend the identity and behavioral model across chains while preserving verifiable execution records.

---

# 20. Summary

Our project uses Uniswap at two levels.

First, we have deployed the PPT token on **Arbitrum mainnet** and created a live Uniswap liquidity position:

https://app.uniswap.org/positions/v3/arbitrum/5712703

Second, our hackathon implementation uses **Uniswap V4 on Sepolia** with a custom hook that tracks per-agent swap activity and emits verifiable on-chain events.

Combined with **ENS** and **World ID**, this produces the following architecture:

```text
Human
   ↓
World ID
   ↓
Agent Identity
   ↓
ENS
   ↓
Uniswap V4
   ↓
Custom Hook
   ↓
On-chain Agent Behavior
   ↓
Reputation / Coordination
```

The project therefore explores a use of Uniswap V4 beyond conventional swapping: **using programmable liquidity infrastructure as a verifiable execution and observability layer for autonomous agents.**

---

# 21. Reviewer Quick Links

| Resource                        | Link                                                  |
| ------------------------------- | ----------------------------------------------------- |
| GitHub Repository               | `[INSERT GITHUB URL]`                                 |
| README                          | `[INSERT README URL]`                                 |
| V4 Hook Contract                | `[INSERT SEPOLIA EXPLORER URL]`                       |
| V4 Pool                         | `[INSERT POOL URL / ID]`                              |
| Sample V4 Transaction           | `[INSERT TRANSACTION URL]`                            |
| Agent Activity Event            | `[INSERT EVENT / TRANSACTION URL]`                    |
| PPT Token                       | `[INSERT ARBITRUM TOKEN URL]`                         |
| Uniswap V3 Position             | https://app.uniswap.org/positions/v3/arbitrum/5712703 |
| Uniswap Developer Feedback Form | https://developers.uniswap.org/hackathon-feedback     |

---

## Verification Checklist

Before submitting the hackathon entry, confirm that the following are populated:

* [ ] Public GitHub repository
* [ ] `FEEDBACK.md` committed to the repository
* [ ] README links directly to `FEEDBACK.md`
* [ ] README identifies the V4 hook file
* [ ] README identifies relevant V4 hook functions
* [ ] V4 hook contract address added
* [ ] Sepolia explorer link added
* [ ] V4 pool ID added
* [ ] PPT token contract address added
* [ ] Sample V4 transaction added
* [ ] Sample hook event added
* [ ] Tests linked
* [ ] Uniswap Developer Feedback Form completed
* [ ] GitHub repository URL included in the feedback form
* [ ] `FEEDBACK.md` URL included in the feedback form
* [ ] All deployed addresses independently verifiable

---

## Submission Statement

This feedback document is provided as part of our ETHGlobal hackathon submission to make the project's Uniswap integration independently verifiable.

The combination of live Uniswap liquidity on Arbitrum and a custom Uniswap V4 hook on Sepolia demonstrates both deployed Uniswap usage and experimentation with programmable V4 infrastructure for identity-aware autonomous agents.
