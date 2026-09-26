require("@nomicfoundation/hardhat-toolbox");

const { privateKey1, privateKey2 } = require('./secrets.json');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/U-GVSL9PaqaHm-FZCJ4cZ_JI55R66lYm",
      accounts: [privateKey1]
    },
    filecoin: {
      url: "https://rpc.ankr.com/filecoin_testnet",
      accounts: [privateKey2]
    }
  }
};