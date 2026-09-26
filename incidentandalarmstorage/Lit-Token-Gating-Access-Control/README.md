# Token-gate the Incident Dashboard Page with 5 different personas using Lit Protocol and WorldID

We are actively exploring and learning how to integrate World ID into our Transport DAO as a human-verification layer. As part of this work, we are extending our incident and alarm dashboard with a prototype that combines World ID with Lit Protocol-based access control, allowing us to experiment with verifying that a user is a unique human before granting access to sensitive transport information and workflows.

This work connects directly to our broader architecture: **Prove unique human → Transport account → Access incident/transport information → Initiate payment → Security screening → User approval → Settlement → Verifiable IPFS/Filecoin receipt**.

Our goal is to use World ID to reduce Sybil/duplicate participation and establish a trusted human entry point for real-world transport services, while keeping identity, payments, and data infrastructure decentralized. We are still learning and refining the World ID integration during the hackathon, but the prototype gives us a concrete foundation for incorporating human verification into our Transport DAO.

**Repository:**
https://github.com/aspiringsecurity/EthTransport/tree/main/incidentandalarmstorage/Lit-Token-Gating-Access-Control

**Demo:**
https://eth-fil-swap-eight.vercel.app/

**Demo video:**
https://www.youtube.com/watch?v=kHbN2B-I-sI

We are extending the example of how to token-gate a Next.js page using [Lit Protocol](https://developer.litprotocol.com/) using `getServerSideProps`.


This token gates a `/protected` page checking to see if the user has a [Devs for Revolution](https://etherscan.io/address/0x25ed58c027921e14d86380ea2646e3a1b5c55a8b) ERC721 token.

To run this example:

1. Clone the repo and install dependencies

```sh
git clone git@github.com:dabit3/nextjs-lit-token-gating.git

cd nextjs-lit-token-gating

npm install
```

2. Update the `accessControlConditions` with the contract address of the NFT you'd like to use:

```javascript
const accessControlConditions = [
  {
    contractAddress: '0x25ed58c027921E14D86380eA2646E3a1B5C55A8b',
    standardContractType: 'ERC721',
    chain: 'ethereum',
    method: 'balanceOf',
    parameters: [
      ':userAddress'
    ],
    returnValueTest: {
      comparator: '>',
      value: '0'
    }
  }
]
```

3. Start the app

```sh
npm run dev
```
