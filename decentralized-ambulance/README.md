# Decentralized First Aid and Ambulance platform at the Incident Site

We are extending and adapting the Chainlink project "Link My Ride" to develop a decentralized first aid and ambulance platform by using Chainlink External Adapter to connect a Tesla Vehicle API to a Chainlink oracle for a peer-to-peer vehicle rental app. We wish to use it for Maruti Vehicle API and Hyundai Vehicle API too. Please visit: https://github.com/aspiringsecurity/EthTransport/tree/main/decentralized-ambulance

## Requirements

- NPM

## Installation

```bash
npm install
```

Or

```bash
yarn install
```

## Deploy

If needed, edit the `truffle-config.js` config file to set the desired network to a different port. It assumes any network is running the RPC port on 8545.

```bash
npm run migrate:dev
```

For deploying to live networks, Truffle will use `truffle-hdwallet-provider` for your mnemonic and an RPC URL. Set your environment variables `$RPC_URL` and `$MNEMONIC` before running:

```bash
npm run migrate:live
```


## Run
Once deployed, the unlockVehicle function can be called, passing in a vehicleId

