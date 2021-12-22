//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TurtleMinter is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address bizContractAddress) ERC721("TV Tokens", "TVNFT") {
        contractAddress = bizContractAddress;
    }

    function mintToken(string memory metadataURI)
    public
    returns (uint256)
    {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(msg.sender, id);
        _setTokenURI(id, metadataURI);
        setApprovalForAll(contractAddress, true);
        return id;
    }
}
