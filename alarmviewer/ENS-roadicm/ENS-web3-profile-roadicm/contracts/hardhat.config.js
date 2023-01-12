require('dotenv').config();
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const {
  WALLET_PK_ROPSTEN,
  ALCHEMY_API_KEY,
  REPORT_GAS_ENABLED,
  OPTIMIZER_ENABLED,
  COINMARKETCAP_API_KEY,
} = process.env

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: !!OPTIMIZER_ENABLED,
        runs: 1000
      }
    }
  },

  paths: {
    sources: './src',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },

  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${WALLET_PK_ROPSTEN}`]
    }
  },

  gasReporter: {
    enabled: !!REPORT_GAS_ENABLED,
    currency: 'EUR',
    coinmarketcap: COINMARKETCAP_API_KEY
  }
};
