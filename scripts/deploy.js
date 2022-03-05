// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
/*
  Capture the address of the wallet to be send funds to 
*/
const fs = require("fs");
const wallet = fs.readFileSync(".wallet").toString();
/*
  see https://hardhat.org/hardhat-network/
  npx hardhat node
  npx hardhat run scripts/deploy.js --network localhost
*/
async function main() {
  const TV = await hre.ethers.getContractFactory("Turtleverse");
  const tv = await TV.deploy("The Turtleverse", "NFTV", "https://ipfs.infura.io/ipfs/", true);
  await tv.deployed()
  console.log("deployed tv to:", tv.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
