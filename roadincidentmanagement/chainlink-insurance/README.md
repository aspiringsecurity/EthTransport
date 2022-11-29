Chainlink: We are extending and adapting the Chainlink project "Link My Ride" to develop a decentralized first aid and ambulance platform by using Chainlink External Adapter to connect a Tesla Vehicle API to a Chainlink oracle for a peer-to-peer vehicle rental app. We wish to use it for Maruti Vehicle API and Hyundai Vehicle API too. Please visit: https://github.com/aspiringsecurity/EthTransport/tree/main/decentralized-ambulance
We are utilizing Chainlink VRF as follows:

E-Challan (Transport Receipt) Bill Generation: We are utilizing Chainlink Mix to work with Chainlink smart contracts. The bill script will deploy a smart contract to goerli and get a Random number via Chainlink VRF, which can used to identify a unique transaction/order number for the receipt or bill.

Parametric Insurance Solution in public transportation especially for project finance. We are utilizing an existing example at chainlink github repo to develop an insurance solution for public transportation. Link: https://github.com/aspiringsecurity/EthTransport/tree/main/roadincidentmanagement

### Get started

Install hardhat
`npm install --save-dev hardhat`

Export your [private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) and get Alchemy API key on `Kovan` (testnet with faucet system currently working and compatible with Keepers).
Create `.env` file with the following properties:

```
ALCHEMY_API_KEY = XXXXXXXXXX
PRIVATE_KEY = XXXXXXXX
```

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

### Running locally

1. `npx hardhat node` or `npx hardhat node --hostname 127.0.0.1`
2. `npx hardhat run scripts/deploy.js --network localhost`

> ℹ️  Connect metamask to Localhost:8545: RPC URL: http://localhost:8545 | Chain ID: 31337

### Deploy

`npx hardhat run scripts/deploy.js --network kovan`

### Frontend

Add and `.env` under `/frontend` folder with the following instruction:

`SKIP_PREFLIGHT_CHECK=true` 

See more [details](https://newbedev.com/javascript-skip-preflight-check-true-to-an-env-file-in-your-project-code-example)

```shell
cd frontend
npm install
npm start
```

### External Adapter

Refer to [Datalistic / Storm Glass External Adapter](https://github.com/InsureBlox/Datalistic_StormGlass_EA_chainlink)

### Test

Run the following command to perform the unit tests:
`npx hardhat test`

**Test coverage**

`npx hardhat coverage`
