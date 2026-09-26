# 🚀 ETHGlobal Tokyo Hackathon 2026 — Trusted ETH ↔ FIL Transport Infrastructure

> **Eth Transport / Transport DAO** is evolving its decentralized road-safety and transport infrastructure platform into a **trusted cross-chain payment and identity workflow**, combining Ethereum, Filecoin, decentralized identity, DeFi liquidity, transaction security, and human authorization.

For the ETHGlobal hackathon, we are building a transport workflow where a citizen, driver, operator, or transport organization can:

**prove they are a unique human → identify their transport account → initiate an ETH/FIL payment → screen the transaction before signing → execute the swap/payment → permanently anchor the transport evidence on IPFS/Filecoin.**

The goal is not simply to add blockchain integrations. Each component solves a specific **trust moment** in the transport workflow.

---

## 🧭 What We Are Building

Transport DAO connects physical-world transport events with verifiable decentralized infrastructure.

A typical workflow looks like:

```text
Citizen / Driver
      │
      ▼
┌─────────────────────┐
│   World ID / IDKit  │
│  Proof of Humanity  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    ENS Identity     │
│ transport.eth /     │
│ user namespace      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Transport Payment   │
│    ETH ↔ FIL        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       1inch         │
│ Swap / DeFi routing │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Intercepta       │
│ Risk / TX screening │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Uniswap        │
│ Liquidity / DeFi    │
│ integration layer   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ IPFS + Filecoin     │
│ Evidence + receipts │
└─────────────────────┘
```

The resulting transport event has both **human trust** and **cryptographic evidence**:

```text
Human proof
    +
ENS identity
    +
Secure payment
    +
Transaction risk check
    +
On-chain settlement
    +
Content-addressed evidence
    =
Verifiable Transport Event
```

---

# 🧑‍🚀 World ID — Human Trust at the Right Moment

We use **World ID / IDKit** at the point where the transport application needs to know that a real, unique human is requesting an important action.

The important design principle is **proportional verification**.

We do not require identity verification for every interaction. Instead, World ID is introduced when a transport workflow needs a meaningful trust decision, such as:

* submitting a high-value road incident;
* requesting a transport service or emergency intervention;
* initiating a financial settlement;
* claiming a transport benefit;
* approving a DAO or infrastructure action;
* authorizing an agent to act on behalf of a person.

This creates a useful distinction between:

```text
Anonymous transport data
        ↓
Authenticated transport account
        ↓
Verified unique human
        ↓
Authorized financial / governance action
```

World's developer platform describes World ID as a privacy-preserving mechanism for verifying unique humans, while IDKit provides the integration toolkit for applications.

### Why this matters for Transport DAO

Transport systems increasingly combine humans, automated services, AI agents, wallets, and physical infrastructure.

We therefore need to answer:

> **Is a real person authorizing this action?**

World ID gives us a privacy-preserving human-verification layer without turning every transport interaction into a conventional KYC workflow.

---

# 💱 ETH ↔ FIL Payments

A major new part of the ETHGlobal implementation is connecting the Ethereum economy with our existing **Filecoin-based transport infrastructure**.

Transport DAO already uses Filecoin/IPFS for decentralized storage, evidence, incident records, and infrastructure data.

The hackathon extends this into the financial workflow:

```text
Ethereum value
      ↓
DeFi / swap infrastructure
      ↓
ETH ↔ FIL settlement workflow
      ↓
Filecoin transport infrastructure
      ↓
Verifiable transport receipt
```

This lets us explore transport use cases where Ethereum users can interact with Filecoin-backed infrastructure without requiring the entire application to move onto one chain.

Examples include:

* paying for transport services;
* funding road-safety infrastructure;
* settling service-provider invoices;
* paying for decentralized storage;
* funding transport DAO work orders;
* rewarding verified incident reporting;
* cross-chain transport infrastructure payments.

Where supported by the deployment, the Ethereum-side swap/route is handled through 1inch, while the Filecoin side remains connected to our existing Filecoin/IPFS infrastructure.

> **Important:** the exact token/network pair used in the live demo is determined by the deployed testnet liquidity and the available 1inch route. We do not describe unsupported native-FIL routing as a 1inch capability.

1inch's current Fusion+ infrastructure supports intent-based cross-chain swaps with resolver competition, escrow-based settlement, and gas abstraction across supported networks.

---

# 🔄 1inch — ETH/FIL DeFi & Cross-Chain Payment Layer

We integrate **1inch** into the transport payment experience rather than presenting it as an isolated swap demo.

The transport application creates a real-world reason for the swap:

> **A transport service needs to move value between the Ethereum ecosystem and Filecoin-backed infrastructure.**

Our integration explores:

* ETH-side swap execution;
* route discovery;
* cross-chain settlement where supported;
* gas abstraction / intent-based execution where available;
* transport-specific payment flows;
* recording the resulting payment reference with the transport event.

1inch Fusion+ uses an intent-based architecture in which the maker signs an order and resolvers compete to fulfill it, with linked escrow contracts providing the settlement mechanism.

### Transport use case

```text
Road incident
     ↓
Verified requester
     ↓
Transport service requested
     ↓
Payment quote
     ↓
1inch route
     ↓
Security screening
     ↓
User approval
     ↓
Settlement
     ↓
IPFS/Filecoin receipt
```

This turns a token swap into a **transport infrastructure primitive**.

---

# 🛡️ Intercepta — Screen Before We Sign

A payment should not become trusted merely because a wallet can sign it.

We integrate **Intercepta** immediately before the transaction authorization step.

The application can screen the relevant wallet, transaction, contract or counterparty and surface a security decision before the user commits funds.

```text
Payment intent
      ↓
Intercepta screening
      ↓
┌─────────────────────────────┐
│ Clear / Warning / Risk     │
│ + reasons / threat signals │
└─────────────┬───────────────┘
              ↓
        User decision
              ↓
          Sign / Block
```

This is particularly important for transport because a future transport application may contain:

* autonomous agents;
* service providers;
* government/civic operators;
* automated payment workflows;
* smart-contract payments;
* cross-chain settlement.

Intercepta's ETHGlobal integration specifically focuses on putting security checks **before the signature**, and its current sandbox provides 1,000 requests for hackathon builders.

### Our key design principle

**Security belongs at the moment of decision.**

Instead of:

```text
Sign → Transaction → Discover problem
```

we implement:

```text
Intent → Screen → Explain → Approve / Reject → Transaction
```

This creates a safer payment experience for both humans and future transport agents.

---

# 🦄 Uniswap — DeFi Liquidity for Transport Payments

We integrate the **Uniswap ecosystem** as the liquidity and programmable DeFi component of the transport payment architecture.

The objective is to make transport infrastructure payments composable with Ethereum liquidity rather than creating a proprietary closed payment system.

Potential integration points include:

* Uniswap swap/liquidity infrastructure;
* transport-related token pairs;
* programmable liquidity;
* v4 extensibility;
* transport-specific payment logic;
* future compliance/risk-aware hooks.

The transport application can therefore connect:

```text
Transport demand
      ↓
Payment requirement
      ↓
Ethereum liquidity
      ↓
Uniswap
      ↓
Settlement
      ↓
Filecoin-backed service
```

For future iterations, **Uniswap v4 hooks** provide an especially interesting extension point for transport-specific controls such as configurable fees, eligibility logic, or other programmable pool behavior.

---

# 🪪 ENSv2 — Human & Agent Transport Namespaces

We use **ENSv2** to move transport identities away from raw wallet addresses.

Instead of presenting:

```text
0x7a...91f
```

the application can represent a participant or service through a human-readable namespace such as:

```text
driver.transport.eth
operator.transport.eth
ambulance.transport.eth
service.transport.eth
agent.transport.eth
```

ENSv2 introduces hierarchical registries and role-based **Enhanced Access Control**, allowing permissions to be scoped to individual names or broader resources.

This is particularly useful for transport because a single organization may have many delegated actors:

```text
transport.eth
   │
   ├── police.transport.eth
   │
   ├── ambulance.transport.eth
   │
   ├── operator.transport.eth
   │
   └── agent.transport.eth
          │
          ├── routing
          ├── payment
          └── incident-reporting
```

ENSv2's hierarchical model and permissioned resolvers allow the identity layer to evolve from simple names into **delegatable namespaces**.

### Why this matters

This creates a common identity vocabulary across:

* people;
* vehicles;
* organizations;
* service providers;
* autonomous agents;
* transport infrastructure.

---

# 🧑‍💻 Agent-Ready Transport Infrastructure

One of the longer-term goals of this implementation is to make Transport DAO usable by **AI agents acting on behalf of humans**.

For example:

```text
Human
  │
  │ World ID
  ▼
Verified human
  │
  │ delegates authority
  ▼
Transport Agent
  │
  ├── ENS identity
  │
  ├── payment request
  │
  ├── Intercepta security check
  │
  ├── 1inch swap
  │
  └── Filecoin evidence
  │
  ▼
Verified transport action
```

World is explicitly developing infrastructure for human-backed agents, including AgentKit, which makes the relationship between a human and an agent part of the trust model.

This makes the hackathon implementation a foundation for future autonomous transport workflows rather than only a human-operated dApp.

---

# 📦 IPFS + Filecoin — Permanent Transport Evidence

The financial and identity layers ultimately connect back to the original Transport DAO architecture.

We continue to use **IPFS/Filecoin** for:

* incident photographs;
* video snapshots;
* road-condition evidence;
* alarm metadata;
* transport-service records;
* payment receipts;
* DAO proposals;
* service-provider documentation;
* audit trails.

A payment can therefore produce a verifiable transport record:

```text
World ID proof
      +
ENS identity
      +
Payment transaction
      +
Intercepta security result
      +
Swap / settlement reference
      +
IPFS CID
      ↓
Filecoin-backed transport record
```

The blockchain records the transaction and authorization while IPFS/Filecoin provides content-addressed evidence and long-term decentralized storage.

---

# 🏗️ ETHGlobal Architecture

```text
                    ┌──────────────────┐
                    │     World ID     │
                    │  Proof of Human  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     ENSv2        │
                    │ Identity / Agent │
                    │   Namespace      │
                    └────────┬─────────┘
                             │
                             ▼
┌──────────────┐     ┌──────────────────┐
│ Transport    │────▶│ Payment Intent   │
│ Event        │     │ ETH ↔ FIL         │
└──────────────┘     └────────┬─────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
          ┌──────────────┐        ┌──────────────┐
          │    1inch     │        │   Uniswap    │
          │ Swap / Route │        │ DeFi / LP    │
          └──────┬───────┘        └──────┬───────┘
                 │                       │
                 └──────────┬────────────┘
                            ▼
                   ┌──────────────────┐
                   │    Intercepta    │
                   │ Security / Risk  │
                   │ Before Signing   │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ Ethereum / FIL   │
                   │ Settlement       │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   IPFS/Filecoin  │
                   │ Evidence + CID   │
                   └──────────────────┘
```

---

# 🏆 ETHGlobal Sponsor Integrations

| Sponsor              | Integration                                         | Transport problem solved                 |
| -------------------- | --------------------------------------------------- | ---------------------------------------- |
| **World ID / IDKit** | Proof of unique human at critical actions           | Sybil resistance and human authorization |
| **1inch**            | ETH/FIL payment and swap workflow                   | Cross-ecosystem value movement           |
| **Intercepta**       | Pre-sign transaction/security screening             | Safer payments and agent actions         |
| **Uniswap**          | DeFi liquidity and programmable swap infrastructure | Composable transport payments            |
| **ENSv2**            | Human, organization and agent namespaces            | Human-readable identity and delegation   |
| **IPFS/Filecoin**    | Evidence, receipts and transport data               | Verifiable decentralized records         |

---

# 🎯 Why These Integrations Belong Together

The hackathon implementation is designed around **five distinct trust questions**:

### 1. Is there a real human behind the action?

**World ID**

### 2. Who is the participant or agent?

**ENSv2**

### 3. Can the value move between the required ecosystems?

**1inch + Uniswap**

### 4. Is it safe to authorize this transaction?

**Intercepta**

### 5. Can we prove what happened later?

**IPFS + Filecoin**

Together:

> **World ID establishes human trust → ENS establishes identity → 1inch/Uniswap move value → Intercepta protects the decision → Filecoin/IPFS preserves the evidence.**

This is the core ETHGlobal innovation we are demonstrating.

---

# 🧪 Hackathon Demo Flow

The primary demo follows one complete transport scenario:

1. A user opens **Eth Transport**.
2. The user selects a transport service / incident workflow.
3. **World ID** verifies that the requester is a unique human.
4. The application resolves the participant/service through **ENS**.
5. A transport payment is generated.
6. The payment requires an **ETH/FIL value conversion**.
7. **1inch** provides the swap/routing layer for the supported deployment.
8. **Intercepta** screens the transaction before signing.
9. The user approves the transaction only after seeing the security result.
10. The payment is executed through the configured Ethereum/DeFi infrastructure.
11. The resulting payment reference and transport metadata are stored on **IPFS**.
12. The evidence is persisted through **Filecoin**.
13. The transport dashboard displays the complete verifiable event.

---

# 🔐 Security & Privacy Model

We deliberately separate different types of trust:

| Layer            | What it proves                                         |
| ---------------- | ------------------------------------------------------ |
| World ID         | A unique human authorized the action                   |
| ENS              | Which human/service/agent namespace is involved        |
| Wallet signature | The authorized account approved the transaction        |
| Intercepta       | Security/risk information was checked before execution |
| Ethereum         | Financial action was recorded on-chain                 |
| IPFS CID         | Evidence has content-addressed integrity               |
| Filecoin         | Data can be persistently stored and retrieved          |

We do **not** treat a wallet address alone as sufficient identity.

Likewise, we do not put all transport evidence directly on-chain.

The architecture deliberately combines:

**privacy-preserving identity + programmable DeFi + transaction security + decentralized storage.**

---

# 🚧 Hackathon Scope vs. Existing Transport DAO

The underlying Transport DAO is an established open-source project with previous integrations across Ethereum, Filecoin, IPFS, Chainlink, Livepeer, XMTP, Push Protocol, FVM and other ecosystems.

The ETHGlobal implementation adds a focused new layer:

```text
Existing Transport DAO
        │
        ├── Road incidents
        ├── Video intelligence
        ├── DAO governance
        ├── Asset management
        └── IPFS/Filecoin storage
                    │
                    ▼
          ETHGlobal 2026 Layer
                    │
        ├── World ID
        ├── ENSv2
        ├── 1inch
        ├── Uniswap
        └── Intercepta
                    │
                    ▼
       Trusted Cross-Chain Transport
              Payment Workflow
```

This allows the hackathon work to remain useful after the event rather than becoming a standalone prototype.

---

# 📚 ETHGlobal Integration Resources

* **World Developer Portal:** https://developer.world.org/
* **World Developer Docs:** https://docs.world.org/
* **1inch:** https://1inch.com/
* **1inch Cross-Chain / Fusion+:** https://business.1inch.com/portal/documentation/apis/swap/cross-chain-swap/introduction
* **Intercepta ETHGlobal:** https://intercepta.io/ethglobal
* **Intercepta:** https://intercepta.io/
* **ENSv2 Documentation:** https://docs.ens.domains/ensv2/overview/
* **Uniswap Developer Documentation:** https://docs.uniswap.org/

---

# 🏅 ETHGlobal Hackathon Tracks

### World ID — Best Use of World ID for Agents

Our implementation uses World ID at a **real trust boundary**, rather than adding it as a login mechanism.

A transport agent may eventually be authorized by a verified human to request services, submit incidents, or initiate payments. World ID provides the human trust layer while ENS provides the agent/service namespace.

The key design decision is determining **when proof of humanity is actually necessary** and requesting it only for consequential actions.

World's current developer materials explicitly position World ID and AgentKit around trusted human-agent interactions.

### 1inch

We use 1inch as the DeFi execution/routing component of the ETH/FIL transport-payment workflow.

The application gives the swap a concrete purpose: enabling Ethereum-side value to participate in Filecoin-backed transport infrastructure and services.

Where Fusion+ is applicable to the selected deployment, its intent-based cross-chain architecture provides a natural foundation for this workflow.

### Intercepta

We integrate Intercepta at the most important point:

> **immediately before the user or agent signs the payment.**

The application presents the security result before authorization and can prevent the user from blindly signing a risky transaction.

This directly follows Intercepta's ETHGlobal integration model of screening before the signature.

### Uniswap

We connect the transport payment experience to Ethereum's composable liquidity infrastructure, with Uniswap providing the DeFi/liquidity component.

The architecture leaves room for a future v4 implementation in which transport-specific logic can be expressed through programmable hooks rather than hard-coded into the entire application.

### ENSv2

We use ENSv2 to give humans, organizations, transport services and future agents meaningful namespaces rather than relying exclusively on hexadecimal wallet addresses.

ENSv2's hierarchical registries and Enhanced Access Control are particularly relevant to delegated transport-agent permissions.

---

# 🚀 Long-Term Vision

Transport DAO is becoming more than an incident-reporting application.

We are building toward a **decentralized coordination layer for physical-world infrastructure**, where:

* humans can prove they are human without exposing unnecessary identity;
* agents can operate under delegated authority;
* organizations can have hierarchical namespaces;
* payments can move across ecosystems;
* transactions can be screened before execution;
* transport events can generate verifiable digital evidence;
* infrastructure data can remain decentralized and persistent.

The long-term architecture is:

> **Human → Identity → Agent → Payment → Security → Infrastructure → Evidence**

with Ethereum and Filecoin providing complementary foundations for programmable finance and decentralized data.

---

## 📜 Original Transport DAO Documentation

The sections below describe the original Transport DAO architecture, historical integrations, funding, demonstrations, and modules. They are intentionally retained for project history and context.
