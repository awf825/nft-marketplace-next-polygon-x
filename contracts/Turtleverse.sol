// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Turtleverse is ERC721, Ownable, ReentrancyGuard {
    string private _baseTokenURI;
    mapping (uint256 => string) private _tokenURIs;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _giveawayList;
    event AddedToGiveawayList(address indexed _address);
    event GiveawaysPurged(uint256 indexed _giveawayPurgedTime);

    EnumerableSet.AddressSet private _whitelist;
    event AddedToWhitelist(address indexed _address);
    event RemovedFromWhitelist(address indexed _address);
    
    uint256 public giveawayPriceToMint = 0 ether;
    uint256 public presalePriceToMint = .025 ether;
    uint256 public priceToMint = .05 ether;

    bool public giveawayActive;
    bool public presaleActive;
    bool public saleActive;

    uint8 public presaleLimit;
    mapping(address => uint) public presalePurchasedAmount; 

    event GiveawayStart(uint256 indexed _giveawayStartTime);
    event GiveawayPaused(uint256 indexed _giveawayStopTime);
    event PresaleStart(uint256 indexed _presaleStartTime);
    event PresalePaused(uint256 indexed _presaleStopTime);
    event SaleStart(uint256 indexed _saleStartTime);
    event SalePaused(uint256 indexed _saleStopTime);

    modifier whenGiveawayActive() {
        require(giveawayActive, "Giveaway not active");
        _;
    }

    modifier whenGiveawayPaused() {
        require(!giveawayActive, "Giveaway not paused");
        _;
    }

    modifier whenPresaleActive() {
        require(presaleActive, "Presale is not active");
        _;
    }

    modifier whenPresalePaused() {
        require(!presaleActive, "Presale is not paused");
        _;
    }

    modifier whenSaleActive() {
        require(saleActive, "Sale is not active");
        _;
    }

    modifier whenSalePaused() {
        require(!saleActive, "Sale is not paused");
        _;
    }

    modifier whenAnySaleActive() {
        require(giveawayActive || presaleActive || saleActive, "There are no sales at this terminated");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;
    }

    function addToWhitelist(address[] memory addresses) external onlyOwner {
        require(addresses.length <= 2000, "Whitelist cannot exceed 2000");
        for(uint index = 0; index < addresses.length; index+=1) {
            if (_whitelist.add(addresses[index])) {
                emit AddedToWhitelist(addresses[index]);
            }
        }
    }

    function removeFromWhitelist(address[] memory addresses) external onlyOwner {
        require(addresses.length <= 2000, "Whitelist cannot exceed 2000");
        for(uint index = 0; index < addresses.length; index+=1) {
            if (_whitelist.remove(addresses[index])) {
                emit RemovedFromWhitelist(addresses[index]);
            }
        }
    }

    function addToGiveawayList(address[] memory addresses) external onlyOwner {
        for(uint index = 0; index < addresses.length; index+=1) {
            if (_giveawayList.add(addresses[index])) {
                emit AddedToGiveawayList(addresses[index]);
            }
        }
    }

    function purgeGiveawayList() external onlyOwner {
        delete _giveawayList;
        emit GiveawaysPurged(block.timestamp);
    }

    function inWhitelist(address value) public view returns (bool) {
        return _whitelist.contains(value);
    }

    function inGiveawayList(address value) public view returns (bool) {
        return _giveawayList.contains(value);
    }
    /* giveaway */
    function startGiveaway() external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        giveawayActive = true;
        emit GiveawayStart(block.timestamp);
    }

    function pauseGiveaway() external onlyOwner whenPresalePaused whenSalePaused whenGiveawayActive {
        giveawayActive = false;
        emit GiveawayPaused(block.timestamp);
    }

    /* presale */

    function startPresale(uint8 presaleLimit_) external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        presaleLimit = presaleLimit_;
        presaleActive = true;
        emit PresaleStart(block.timestamp);
    }

    function pausePresale() external onlyOwner whenGiveawayPaused whenSalePaused whenPresaleActive {
        presaleActive = false;
        emit PresalePaused(block.timestamp);
    }

    /* real sale */ 

    function startPublicSale() external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        saleActive = true;
        emit SaleStart(block.timestamp);
    }

    function pausePublicSale() external onlyOwner whenGiveawayPaused whenPresalePaused whenSaleActive {
        saleActive = false;
        emit SalePaused(block.timestamp);
    }

    function price() external view returns (uint256) {
        if (giveawayActive) { return giveawayPriceToMint; }
        else if (presaleActive) { return presalePriceToMint; }
        else { return priceToMint; }
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _processMint(address recipient, string calldata tokenHash) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, string(abi.encodePacked(_baseTokenURI,tokenHash)));
        return newItemId;
    }

    function _preValidatePurchase(uint256 tokensAmount) internal view {
        require(msg.sender != address(0));
        require(tokensAmount > 0, "Must mint at least one token");
        //require(totalSupply() + tokensAmount <= publicLimit(), "DA: Minting would exceed max supply");
        if (giveawayActive) {
            require(inGiveawayList(msg.sender), "Address isn't whitelisted");
        } else if (presaleActive) {
            require(inWhitelist(msg.sender), "Address isn't whitelisted");
            require(tokensAmount + presalePurchasedAmount[msg.sender] <= presaleLimit, "Presale, limited amount of tokens");
            require(presalePriceToMint * tokensAmount <= msg.value, "Presale, insufficient funds");
        } else {
            require(priceToMint * tokensAmount <= msg.value, "Insufficient funds");
        }
    }

    function mintTokens(uint256 tokensAmount, string[] calldata tokenHashes) external payable whenAnySaleActive nonReentrant returns (uint256[] memory) {
        _preValidatePurchase(tokensAmount);
        uint256[] memory tokens = new uint256[](tokensAmount);
        for (uint index = 0; index < tokensAmount; index += 1) {
            tokens[index] = _processMint(msg.sender, tokenHashes[index]);
            // _setTokenURI(tokens[index], tokenURIs[index]);
        }
        if (presaleActive) {
            presalePurchasedAmount[msg.sender] += tokensAmount;
        }
        return tokens;
    }

    function withdraw(address payable wallet, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance);
        wallet.transfer(address(this).balance);
    }
}