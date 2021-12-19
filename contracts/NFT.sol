// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
    https://dev.to/mateusasferreira/how-to-create-a-resell-token-functionality-in-your-nft-marketplace-smart-contract-ha
*/

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    /*
        Counters package creates an incremental unique identifier for each token
        when first token is minted, id is 1, when second, 2 ... ...

        contractAddress is address of the marketplace that we want to allow the nft to be able to interact with or vice versa.
        We want to be able to give the nft market the ability to transact these tokens or change the ownership of 
        these tokens from a separate contract
    */
    Counters.Counter private _tokenIds;
    address contractAddress;

    /*
        constructor method takes in address as the only arg; when we deploy this contract, we need to pass in
        the address of the actual marketplace. So we're first deploying the actual market, and then this contract.

        createToken is for minting new tokens. We don;t need to pass much data here because function will come 
        with metadata about the user, since its a transaction (i.e message.sender identifies the minter/buyer etc)
        For each tokenId generated, an nft is minted. We return the newItemId for the sake of our client app. We 
        are going to be minting with this contract, but then selling the nft in a separate transaction. 
    */

    constructor(address marketplaceAddress) ERC721("Metaverse Tokens", "METT") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }

}