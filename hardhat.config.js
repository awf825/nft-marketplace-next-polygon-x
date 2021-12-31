/* 
  do we want to interact with public or private RPC endpoints with polygon?
  https://docs.polygon.technology/docs/develop/network-details/network

  Private key is from my metamask account. This basically allows me to make transactions 
  on the network.
*/

require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: "./.env" });

const fs = require("fs");
// const privatePayload = fs.readFileSync(".secret").toString();
// const [privateKey, alchemyApiId] = privatePayload.split("@");

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
    // mumbai: {
    //   url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
    //   accounts: [privateKey]
    // },
    // mainnet: {
    //   url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
    //   accounts: [privateKey]
    // }
  },
  solidity: "0.8.4",
};


