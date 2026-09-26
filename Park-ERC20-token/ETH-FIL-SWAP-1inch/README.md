
# ETH-FIL Atomic Swap

This project enables atomic swaps of ERC20 tokens between Ethereum and Filecoin networks. It uses a trusted escrow contract to facilitate the swap, ensuring that the exchange is atomic and secure. This implementation is designed for EVM-compatible chains and does not rely on a centralized exchange.

## How It Works

The process involves two parties, Party A and Party B, who wish to swap tokens. Party A initiates the swap by deploying an escrow contract on an Ethereum-based chain (e.g., Sepolia). This contract holds the tokens to be exchanged. Party B, on a Filecoin-based chain (e.g., Filecoin Calibrationnet), interacts with a corresponding escrow contract to complete the swap.

The swap is "atomic" because it is executed as a single, indivisible transaction. If any part of the swap fails, the entire transaction is rolled back, and the tokens are returned to their original owners. This is made possible through the use of a shared secret that both parties must provide to unlock the funds.

[Document on the Implementation Plan](https://docs.google.com/document/d/1A47U3gIIVt4i2WRAlndYTpDqO0upRDxOTfoBPUqEziQ/edit?tab=t.0#heading=h.vz2oj8np5cf2)


## Getting Started


### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ETH-FIL-SWAP.git
   cd ETH-FIL-SWAP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `secrets.json` file in the root directory and replacing the privatekey values with your own

## Usage

### 1. Deploy the Escrow Contracts

First, deploy the escrow contracts to both the Sepolia and Filecoin networks:

- **Deploy to Sepolia (Chain A):**
  ```bash
  npx hardhat run scripts/deploy_chain_a.js --network sepolia
  ```

- **Deploy to Filecoin (Chain B):**
  ```bash
  npx hardhat run scripts/deploy_chain_b.js --network filecoin
  ```

These scripts will deploy the `Escrow.sol` contract to each network 

### 2. Fund the Escrow Contracts

After deploying the contracts, you need to fund them with the tokens to be swapped. You can do this by sending tokens to the escrow contract addresses.

### Example
To see how the swap will work simply run the below command 

```bash
npx hardhat run scripts/execute_swap.js --network sepolia
```

This script will initiate the swap on the Sepolia network, which will then be reflected on the Filecoin network. 


## Demo 
[Demo Video on Testnet](https://www.youtube.com/watch?v=kHbN2B-I-sI) 

Going live on Mainnet after Thanksgiving week :)

[Project Screencasts](https://drive.google.com/file/d/1J1I9ig7NKCyU_gXo_vgbwiq3GraFuRMZ/view)

## Twitter Discussion on Mainnet deployment planning

Please visit https://x.com/momack28/status/1992768978155135159

