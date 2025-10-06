import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition";
import "dotenv/config";


const config: HardhatUserConfig = {
  solidity: "0.8.28", 
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
};

export default config;
