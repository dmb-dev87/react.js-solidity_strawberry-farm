import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3"
import "@nomiclabs/hardhat-etherscan";

require('dotenv').config()

export default {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    kovan: {
      gas: "auto",
      gasPrice: "auto",
      url: process.env.KOVAN_KEY,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    rinkeby: {
      gas: "auto",
      gasPrice: "auto",
      url: process.env.RINKEBY_KEY,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}