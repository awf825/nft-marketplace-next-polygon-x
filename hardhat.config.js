/* 
  do we want to interact with public or private RPC endpoints with polygon?
  https://docs.polygon.technology/docs/develop/network-details/network

  Private key is from my metamask account. This basically allows me to make transactions 
  on the network.
*/

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({ path: "./.env" });

module.exports = {
  // the name of app, config different networks here
  networks: {
    hardhat: {
      // hardhat specific, will inject and use accounts for us when playing locally
      chainId: 31337
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_ROPSTEN}`,
      accounts: [process.env.METAMASK_PRIVATE_KEY_TEST]
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_RINKEBY}`,
      accounts: [process.env.METAMASK_PRIVATE_KEY_TEST]
    }
    // mainnet: {
    //   url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
    //   accounts: [privateKey]
    // }
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY
  // },
  solidity: "0.8.4",
};


