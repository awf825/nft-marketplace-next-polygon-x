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
  const maxWithdrawal = hre.ethers.BigNumber.from("200000000000000000");
  const presaleLimit = hre.ethers.BigNumber.from(4);
  const tv = await TV.deploy(
    "NFTurtleverse",
    "NFTV", 
    "https://2f68ucdu28.execute-api.us-east-1.amazonaws.com/dev/d00dwHEREsTHEturt13s/", 
    presaleLimit,
    wallet,
    maxWithdrawal
  );
  await tv.deployed()
  console.log("deployed tv to:", tv.address)
  let owner = await tv.owner();
  console.log("tv.owner: ", owner)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
