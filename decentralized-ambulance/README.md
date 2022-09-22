# Tesla Consumer Contract

Demonstrating how to connect a Smart Contract to a Tesla Vehicle

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

