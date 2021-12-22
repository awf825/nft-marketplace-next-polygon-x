// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

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

  // We get the contract to deploy
  // const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  // const nftMarket = await NFTMarket.deploy();
  // await nftMarket.deployed();
  // console.log("nftMarket deployed to:", nftMarket.address)

  // const NFT = await hre.ethers.getContractFactory("NFT");
  // const nft = await NFT.deploy(nftMarket.address);
  // await nft.deployed();
  // console.log("nft deployed to:", nft.address)
  const wallet = "0xB154Dc24df1404946F304FFcDA78378BdF6501AA";

  const Biz = await hre.ethers.getContractFactory("Biz");
  const biz = await Biz.deploy(wallet);
  await biz.deployed()
  console.log("deployed biz to:", biz.address)

  const TurtleMinter = await hre.ethers.getContractFactory("TurtleMinter");
  const turtleMinter = await TurtleMinter.deploy(biz.address);
  await turtleMinter.deployed()
  console.log("deployed turtleMinter to:", turtleMinter.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
