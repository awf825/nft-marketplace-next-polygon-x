const { expect } = require("chai");
const { ethers } = require("hardhat");

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
        tv = await tvFactory.deploy("The Turtleverse", "NFTV", "", true);
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
        await expect(tv.connect(addr1).startPresale(ethers.BigNumber.from(3))).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPresale = await tv.startPresale(ethers.BigNumber.from(3));
        await startPresale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".025"));
    });

    it("Presale should start and set price to .05 eth and to revert if not called by the owner", async function () {
        await expect(tv.connect(addr1).startPublicSale(ethers.BigNumber.from(5))).to.be.reverted;
        expect(await tv.owner()).to.equal(owner.address);

        const startPublicSale = await tv.startPublicSale(ethers.BigNumber.from(5));
        await startPublicSale.wait();

        expect(await tv.price()).to.equal(ethers.utils.parseEther(".05"));
    });
});