const { expect } = require("chai");
const { ethers } = require("hardhat");

// idea here is to simulate bopth contracts, creating a new nft, putting nft for sale 
// on the market and purchasing it from someone else

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    // deploy the market and wait for it to be deployed, get 
    // reference to address its deployed to
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    // get reference to the nft contract
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address
    
    // gonna need a way to find out how much the listing price is 
    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('100', 'ether')

    // here is where nft is created
    await nft.createToken("https://www.mytokenlocation2.com")
    await nft.createToken("https://www.mytokenlocation.com")

    // now that our tokens are created, they can be listed on the market
    // LISTING PRICE IS PAID TO CONTRACT OWNER
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })

    const [_, buyerAddress] = await ethers.getSigners()

    // we want to use this buyer address to connect to the market
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice })

    let items = await market.fetchMarketItems()
    //let items = await market.fetchMyNFTs()
    
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    console.log('items: ', items)
  });
});
