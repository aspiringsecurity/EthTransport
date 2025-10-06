# Incident App on Celo

## Smart Contracts Setup

1. Navigate to the `hardhat` directory:

```bash
cd hardhat
```

2. Configure your environment variables:

* Copy from `.env.template` and create your `.env` file accordingly.

3. Install dependencies:

```bash
npm install
```

4. Compile the contracts:

```bash
npx hardhat compile
```

5. Deploy the contracts to the Celo Alfajores testnet:

```bash
npx hardhat deploy ./ignition/modules/IncidentManagerModule.ts --network alfajores
```

## Web Application Setup

1. Navigate to the `Incident-webapp` directory:

```bash
cd Incident-webapp
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

**Note:** Ensure that the Celo Alfajores testnet is added to your MetaMask wallet in your browser.

## Deployed Contract

The smart contract is deployed at:
[0x3ab0dCEF4F1A3d005B68F2527F96C47FAb656BAC on Alfajores Blockscout](https://celo-alfajores.blockscout.com/address/0x3ab0dCEF4F1A3d005B68F2527F96C47FAb656BAC?tab=index)
