/* 
  do we want to interact with public or private RPC endpoints with polygon?
  https://docs.polygon.technology/docs/develop/network-details/network

  Private key is from my metamask account. This basically allows me to make transactions 
  on the network.
*/

require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
// const privateKey = fs.readFileSync(".env").toString();
// const privateKey = process.env.metamaskTestAccount.toString();
// const projectId = process.env.infuraProjectId;

module.exports = {
  // the name of app, config different networks here
  networks: {
    hardhat: {
      // hardhat specific, will inject and use accounts for us when playing locally
      chainId: 31337
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


