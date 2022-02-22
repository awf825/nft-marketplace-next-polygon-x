// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Turtleverse is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    // using EnumerableSet for EnumerableSet.AddressSet;
    // EnumerableSet.AddressSet private _whitelist;
    // event AddedToWhitelist(address indexed _address);
    // event RemovedFromWhitelist(address indexed _address);

    string private _baseTokenURI;
    uint256 priceToMint = .05 ether;

    // uint16 public addToAllowListLimit;
    // uint16 public removeFromAllowListLimit;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;
    }

    function getPriceToMint() public view returns (uint256) {
        return priceToMint;
    }

    function _processMint(address recipient) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        return newItemId;
    }

    function mintTokens(uint256 tokensAmount) external payable nonReentrant returns (uint256[] memory) {
        /* apply the business rules later */
        // _preValidatePurchase(tokensAmount);

        uint256[] memory tokens = new uint256[](tokensAmount);
        for (uint index = 0; index < tokensAmount; index += 1) {
            tokens[index] = _processMint(msg.sender);
        }

        // if (presaleActive) {
        //     presalePurchasedAmount[msg.sender] += tokensAmount;
        // }

        return tokens;
    }

    function withdraw(address payable wallet, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance);
        wallet.transfer(address(this).balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}