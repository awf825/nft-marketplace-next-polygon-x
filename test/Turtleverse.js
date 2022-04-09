/*
    Add these to contract in order to test
    function getCurrentToken() external view onlyOwner returns (uint256) {
        return  _tokenIds.current();
    }

    function getMaxSupply() external view onlyOwner returns (uint256) {
        return _maxSupply;
    }

        // function _processMint(address recipient, string memory tokenHash) internal returns (uint256) {
    //     _tokenIds.increment();
    //     uint256 newItemId = _tokenIds.current();
    //     _safeMint(recipient, newItemId);
    //     // _setTokenURI(newItemId, tokenHash);
    //     return newItemId;
    // }
*/

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

        const presaleLimit = ethers.BigNumber.from(3);
        const maxWithdrawal = ethers.BigNumber.from("500000000000000000"); // .5 eth
        tv = await tvFactory.deploy(
          "The Turtleverse",
          "NFTV", 
          "https://ipfs.infura.io/ipfs/", 
          presaleLimit,
          wallet,
          maxWithdrawal
        );
        await tv.deployed();
    })

    it("Giveaway should start and set price to 0 and to revert if not called by the owner", async function () {
        await expect(tv.connect(addr1).startGiveaway()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startGiveaway = await tv.startGiveaway();
        await startGiveaway.wait();

        expect(await tv.price()).to.equal(0);
    });

    it("Giveaway should stop and be reverted if not called by the owner. Minting should be paused.", async function () {
        await expect(tv.connect(addr1).pauseGiveaway()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        await tv.startGiveaway()

        const stopGiveaway = await tv.pauseGiveaway();
        await stopGiveaway.wait();

        // expect(await tv.price()).to.equal(0);
        const one = ethers.BigNumber.from(1);
        try {
            await tv.price();
        } catch (err) {
            assert.isNotNull(err, "can't fetch price when no sale active")
        }

        try {
            await tv.connect(owner).mintTokens(one, [""]);
        } catch (err) {
            assert.isNotNull(err, "can't mint when no sale active")
        }
    });

    it("Presale should start and set price to .025 eth and to revert if not called by the owner", async function () {
        await tv._presaleLimit;

        await expect(tv.connect(addr1).startPresale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPresale = await tv.startPresale();
        await startPresale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".025"));
    });

    it("Presale should stop and be reverted if not called by the owner. Minting should be paused", async function () {
        await expect(tv.connect(addr1).pausePresale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        await tv.startPresale();

        const pausePresale = await tv.pausePresale();
        await pausePresale.wait();

        const one = ethers.BigNumber.from(1);
        try {
            await tv.price();
        } catch (err) {
            assert.isNotNull(err, "can't fetch price when no sale active")
        }

        try {
            await tv.connect(owner).mintTokens(one, [""]);
        } catch (err) {
            assert.isNotNull(err, "can't mint when no sale active")
        }
    });

    it("Sale should start and set price to .05 eth and to revert if not called by the owner", async function () {
        await expect(tv.connect(addr1).startPublicSale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPublicSale = await tv.startPublicSale();
        await startPublicSale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".05"));
    });

    it("Sale should stop and be reverted if not called by the owner. Mint should be paused", async function () {
        await expect(tv.connect(addr1).pausePublicSale()).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        await tv.startPublicSale();

        const pausePublicSale = await tv.pausePublicSale();
        await pausePublicSale.wait();

        const one = ethers.BigNumber.from(1);
        try {
            await tv.price();
        } catch (err) {
            assert.isNotNull(err, "can't fetch price when no sale active")
        }

        try {
            await tv.connect(owner).mintTokens(one, [""]);
        } catch (err) {
            assert.isNotNull(err, "can't mint when no sale active")
        }
    });

    it("Should be able to add to the whitelist at any time. Entry should be added. Can remove entries from whitelist. addr should be allowed to mint after being whitelisted. Call should be reverted if not owner.", async function () {
        await expect(tv.connect(addr1).addToWhitelist([addr2.address])).to.be.reverted;
        // expect(await tv.owner()).to.equal(owner.address);
        // why can't I get args?
        await expect(tv.connect(owner).addToWhitelist([addr1.address])).to.emit(tv, 'AddedToWhitelist')
        // assert.isTrue(await tv.connect(owner).inWhitelist(addr1.address))
        await tv.startGiveaway();

        const one = ethers.BigNumber.from(1);
        try {
            let price = await tv.price();
            await tv.connect(addr1).mintTokens(one, { value: price });
        } catch (err) {
            assert.isNull(err, "Should be able to mint")
        }

        await expect(tv.connect(owner).removeFromWhitelist([addr1.address])).to.emit(tv, 'RemovedFromWhitelist')

        try {
            let price = await tv.price();
            await tv.connect(addr1).mintTokens(one, { value: price });
        } catch (err) {
            assert.isNotNull(err, "Should NOT be able to mint")
        }

        await expect(tv.connect(owner).addToWhitelist([addr1.address, addr2.address])).to.emit(tv, 'AddedToWhitelist')
        try {
            let price = await tv.price();
            await tv.connect(addr1).mintTokens(one, { value: price });
            await tv.connect(addr2).mintTokens(one, { value: price });
        } catch (err) {
            assert.isNull(err, "Should be able to mint")
        }

        await expect(tv.connect(owner).removeFromWhitelist([addr1.address, addr2.address])).to.emit(tv, 'RemovedFromWhitelist')
        try {
            let price = await tv.price();
            await tv.connect(addr1).mintTokens(one, { value: price });
            await tv.connect(addr2).mintTokens(one, { value: price });
        } catch (err) {
            assert.isNotNull(err, "Should NOT be able to mint")
        }
    })

    it("Should be able to mint during public sale, but need to mint more than one.", async function () {
        // let provider = ethers.getDefaultProvider();
        // const wallet = ethers.Wallet.createRandom().connect(provider);
        const zero = ethers.BigNumber.from(0);
        const one = ethers.BigNumber.from(1);
        await tv.startPublicSale();
        let price = await tv.price();

        await expect(tv.connect(owner).mintTokens(zero, { value: price })).to.be.reverted;
        await tv.connect(owner).mintTokens(one, { value: price })
    })

    // it("Tokens should not exceed maxSupply (10). Tokens should start at 0, and increment by 1 up to maxSupply.", async function () {
    //     let currentToken;
    //     await tv.startPublicSale();
    //     let price = await tv.price();
    //     const one = ethers.BigNumber.from(1);

    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 0)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 1)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 2)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 3)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 4)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 5)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 6)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 7)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 8)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 9)
    //     await tv.connect(owner).mintTokens(one, { value: price });
    //     currentToken = await tv.totalSupply();
    //     assert.equal(currentToken.toNumber(), 10)

    //     await expect(tv.connect(owner).mintTokens(one, { value: price })).to.be.reverted
    // })

    it("Royalty should payout to payout address AND royalty amount should be 10%", async function () {
        await tv.startPublicSale();
        let price = await tv.price();
        const one = ethers.BigNumber.from(1);
        const salePrice = ethers.utils.parseEther("10");
        const finalRoyalty = ethers.utils.parseEther("1");

        await tv.connect(owner).mintTokens(one, { value: price });
        
        let royaltyInfo = await tv.royaltyInfo(1, salePrice)
        const royaltyReceiver = royaltyInfo.receiver
        const royaltyPercentage = royaltyInfo.royaltyAmount
        
        expect(royaltyPercentage).to.equal(finalRoyalty);
        assert.equal(royaltyReceiver, wallet)
    })

    it("Should set the baseUri to provided url and should be reverted by non-owner.", async function () {
        let currentToken;
        let tokenURI;
        await tv.startPublicSale();
        let price = await tv.price();
        const one = ethers.BigNumber.from(1);

        await tv.connect(owner).mintTokens(one, { value: price });
        currentToken = await tv.totalSupply();
        assert.equal(currentToken.toNumber(), 1)
        tokenURI = await tv.tokenURI(one);
        assert.equal(tokenURI, "https://ipfs.infura.io/ipfs/1")

        // expect(tv.tokenURI(1)).to.equal("https://ipfs.infura.io/ipfs/1");

        await tv.connect(owner).setBaseURI("https://newUrl/")
        tokenURI = await tv.tokenURI(one);
        assert.equal(tokenURI, "https://newUrl/1")

        await expect(tv.connect(addr1).setBaseURI("https://noUrl/")).to.be.reverted

        // expect(tv.tokenURI(one)).to.equal("https://newUrl/1");
        // expect()
    })

    it("Should be able to withdraw to proper payout wallet specified in constructor. Should be reverted if balance is under .5 eth.", async function () {
        let contractBalance;
        let walletBalance;
        const priceOfOne = ethers.utils.parseEther(".05");
        const priceOfTwo = ethers.utils.parseEther(".1");
        const priceOfThree = ethers.utils.parseEther(".15");
        const priceOfFour = ethers.utils.parseEther(".2");
        const priceOfFive = ethers.utils.parseEther(".25");
        const priceOfSix = ethers.utils.parseEther(".3");
        const priceOfSeven = ethers.utils.parseEther(".35");
        const priceOfEight = ethers.utils.parseEther(".4");
        const priceOfNine = ethers.utils.parseEther(".45");
        const priceOfTen = ethers.utils.parseEther(".5");
        let provider = ethers.provider;
        await tv.startPublicSale();
        let price = await tv.price();
        const one = ethers.BigNumber.from(1);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfOne);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfTwo);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfThree);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfFour);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfFive);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfSix);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfSeven);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfEight);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfNine);

        await tv.connect(owner).mintTokens(one, { value: price });
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(priceOfTen);

        await tv.connect(owner).withdraw();
        contractBalance = await provider.getBalance(tv.address);
        expect(contractBalance).to.equal(0);
        walletBalance = await provider.getBalance(wallet);
        expect(walletBalance).to.equal(priceOfTen);
    })

    // it("Should be able to withdraw larger amounts of ether.", async function () {
    //     let contractBalance;
    //     let walletBalance;
    //     const oneEth = ethers.utils.parseEther("1");
    //     const tenEth = ethers.utils.parseEther("10");
    //     const hundoEth = ethers.utils.parseEther("100");

    //     let provider = ethers.provider;
    //     await tv.startPublicSale();
    //     const one = ethers.BigNumber.from(1);

    //     // 1 eth
    //     await tv.connect(owner).mintTokens(one, { value: "1000000000000000000" });
    //     contractBalance = await provider.getBalance(tv.address);
    //     expect(contractBalance).to.equal("1000000000000000000");
    //     await tv.connect(owner).withdraw();
    //     contractBalance = await provider.getBalance(tv.address);
    //     expect(contractBalance).to.equal(0);
    //     walletBalance = await provider.getBalance(wallet);
    //     expect(walletBalance).to.equal("1000000000000000000");
    //     console.log("contractBalance after withdrawing 1 eth: ", contractBalance)
    //     // 10 eth
    //     await tv.connect(owner).mintTokens(one, { value: "10000000000000000000" });
    //     contractBalance = await provider.getBalance(tv.address);
    //     console.log("contractBalance after mint of 10 eth: ", contractBalance)

    //     expect(contractBalance).to.equal("10000000000000000000");
    //     await tv.connect(owner).withdraw();
    //     contractBalance = await provider.getBalance(tv.address);
    //     expect(contractBalance).to.equal(0);
    //     walletBalance = await provider.getBalance(wallet);
    //     expect(walletBalance).to.equal("11000000000000000000");
    //     console.log("contractBalance after withdrawing 10 eth: ", contractBalance)
        
    //     // 100 eth
    //     await tv.connect(owner).mintTokens(one, { value: "100000000000000000000" });
    //     contractBalance = await provider.getBalance(tv.address);
    //     expect(contractBalance).to.equal("100000000000000000000");
    //     await tv.connect(owner).withdraw();
    //     contractBalance = await provider.getBalance(tv.address);
    //     expect(contractBalance).to.equal(0);
    //     walletBalance = await provider.getBalance(wallet);
    //     expect(walletBalance).to.equal("111000000000000000000");
    //     console.log("contractBalance after withdrawing 100 eth: ", contractBalance)
    // })

    // should not be able to mint an existing token id
    // url hash should be a certain length 

    // value mist equal .025 for presale, .05 for public sale 
});
