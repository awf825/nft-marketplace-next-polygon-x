/*
    !!! variable created for owner of contract !!!
    We set this b/c we want to be able to determine who is the owner of the 
    contract: they make commiss on every item sold. 
    We will charge a listing fee. Anyone that decides to list an item will pay a listing fee, 
    and anyone that decides to list an item has to pay that listing fee and contract owner
    makes commis on everyone elses transactions.
*/
// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Biz is ReentrancyGuard {
    using Counters for Counters.Counter;
    /* each individual market item */
    Counters.Counter private _itemIds;
    /* we need to keep up with itemsSold b/c we need to know length of arrays */
    Counters.Counter private _itemsSold;

    address payable bizWallet;
    address owner;
    uint256 priceToMint = .05 ether;

    constructor(address bizWalletAddress) {
        owner = msg.sender;
        bizWallet = payable(bizWalletAddress);
    }

    struct Turtle {
        uint itemId;
        address turtleMinterContract;
        uint256 tokenId;
        address owner;
        bool sold;
    }

    mapping(uint256 => Turtle) private idToTurtle;

    function getPriceToMint() public view returns (uint256) {
        // NEED LOGIC FOR DISCORD WHITELIST
        return priceToMint;
    }

    function createTurtle(
        address turtleMinterContract,
        uint256 tokenId
    ) public payable nonReentrant {
        require(msg.value == priceToMint, "Price must be equal to price to mint");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToTurtle[itemId] = Turtle(
            itemId,
            turtleMinterContract,
            tokenId,
            owner,
            false
        );

        //IERC721(turtleMinterContract).transferFrom(msg.sender, address(this), tokenId);
        // IERC721(turtleMinterContract).transferFrom(turtleMinterContract, owner, tokenId);

        // idToTurtle[itemId].owner = msg.sender;
        idToTurtle[itemId].sold = true;
        _itemsSold.increment();
        payable(bizWallet).transfer(priceToMint);
    }
}