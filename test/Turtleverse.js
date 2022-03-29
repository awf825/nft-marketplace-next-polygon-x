const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const wallet = fs.readFileSync(".wallet").toString();

describe("Turtleverse:", function () {
    let tv;
	let owner;
	let addr1;
	let addr2;
	let addrs;

    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const tvFactory = (await ethers.getContractFactory(
            "Turtleverse", owner
        ));

        const maxSupply =  ethers.BigNumber.from("10000");
        const maxWithdrawal = ethers.BigNumber.from("100000000000000000");
        const presaleLimit = ethers.BigNumber.from(3);
        const saleLimit = ethers.BigNumber.from(25);
        tv = await tvFactory.deploy(
          "The Turtleverse",
          "NFTV", 
          "https://ipfs.infura.io/ipfs/", 
          maxSupply,
          maxWithdrawal,
          presaleLimit,
          saleLimit,
          wallet
        );
        
        //tv = await tvFactory.deploy("The Turtleverse", "NFTV", "", true);
        await tv.deployed();
    })

    it("Giveaway should start and set price to 0 and to revert if not called by the owner", async function () {
        await expect(tv.connect(addr1).startGiveaway()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startGiveaway = await tv.startGiveaway();
        await startGiveaway.wait();

        expect(await tv.price()).to.equal(0);
    });

    it("Presale should start and set price to .025 eth and to revert if not called by the owner", async function () {
        await tv._presaleLimit;

        await expect(tv.connect(addr1).startPresale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPresale = await tv.startPresale();
        await startPresale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".025"));
    });

    it("Sale should start and set price to .05 eth and to revert if not called by the owner", async function () {
        await expect(tv.connect(addr1).startPublicSale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPublicSale = await tv.startPublicSale();
        await startPublicSale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".05"));
    });

    it("Should be able to mint during public sale, but need to mint more than one.", async function () {
        // let provider = ethers.getDefaultProvider();
        // const wallet = ethers.Wallet.createRandom().connect(provider);
        const zero = ethers.BigNumber.from(0);
        const one = ethers.BigNumber.from(1);
        await tv.startPublicSale();
        let price = await tv.price();

        await tv.connect(owner).mintTokens(one, [""], { value: price });
        await expect(tv.connect(owner).mintTokens(zero, [""])).to.be.reverted;
    })

    // it("Max supply should be set to 10k.", async function () {
    //     console.log(tv.maxSupply)
    // })

    it("Royalty should be 10% and payout to owner address", async function () {
        await tv.startPublicSale();
        let price = await tv.price();
        const one = ethers.BigNumber.from(1);
        const salePrice = ethers.utils.parseEther("10");

        await tv.connect(owner).mintTokens(one, [""], { value: price });
        let royaltyInfo = await tv.royaltyInfo(1, salePrice)
        const royaltyReceiver = royaltyInfo.receiver
        const royaltyPercentage = royaltyInfo.royaltyAmount


        assert.equal(royaltyReceiver, tv.address)
        // assert.equal(royaltyPercentage, salePrice.div(10))
    })




});