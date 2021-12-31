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
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const Biz = await hre.ethers.getContractFactory("Biz");
  const biz = await Biz.deploy(wallet);
  await biz.deployed()
  console.log("deployed biz to:", biz.address)

  const TurtleMinter = await hre.ethers.getContractFactory("TurtleMinter");
  const turtleMinter = await TurtleMinter.deploy(biz.address);
  await turtleMinter.deployed()
  console.log("deployed turtleMinter to:", turtleMinter.address)

  // const Market = await hre.ethers.getContractFactory("NFTMarket");
  // const market = await Market.deploy();
  // await market.deployed()
  // console.log("deployed market to:", market.address)

  // const NFT = await hre.ethers.getContractFactory("NFT");
  // const nft = await NFT.deploy(market.address);
  // await nft.deployed()
  // console.log("deployed nft to:", nft.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
