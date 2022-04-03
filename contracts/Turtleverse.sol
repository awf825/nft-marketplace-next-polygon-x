// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Turtleverse is ERC721, IERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping (uint256 => string) private _tokenURIs;

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _whitelist;

    string private _baseTokenURI;
    uint256 private _maxSupply;
    uint256 private _maxWithdrawal;
    uint8 private _presaleLimit;
    uint8 private _saleLimit;
    address payable private _payout;

    mapping(address => uint) public purchasedAmount;

    event AddedToWhitelist(address indexed _address);
    event RemovedFromWhitelist(address indexed _address);
    
    uint256 public giveawayPriceToMint = 0 ether;
    uint256 public presalePriceToMint = .025 ether;
    uint256 public priceToMint = .05 ether;

    bool public giveawayActive;
    bool public presaleActive;
    bool public saleActive;

    event GiveawayStart(uint256 indexed _giveawayStartTime);
    event GiveawayPaused(uint256 indexed _giveawayStopTime);
    event PresaleStart(uint256 indexed _presaleStartTime);
    event PresalePaused(uint256 indexed _presaleStopTime);
    event SaleStart(uint256 indexed _saleStartTime);
    event SalePaused(uint256 indexed _saleStopTime);

    modifier whenGiveawayActive() { require(giveawayActive, "Giveaway not active"); _; }
    modifier whenGiveawayPaused() { require(!giveawayActive, "Giveaway not paused"); _; }
    modifier whenPresaleActive() { require(presaleActive, "Presale is not active"); _; }
    modifier whenPresalePaused() { require(!presaleActive, "Presale is not paused"); _; }
    modifier whenSaleActive() { require(saleActive, "Sale is not active"); _; }
    modifier whenSalePaused() { require(!saleActive, "Sale is not paused"); _; }
    modifier whenAnySaleActive() { require(giveawayActive || presaleActive || saleActive, "There are no sales at this terminated"); _; }

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 maxWithdrawal_,
        uint8 presaleLimit_,
        uint8 saleLimit_,
        address payable payout_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;
        _maxSupply = maxSupply_;
        _maxWithdrawal = maxWithdrawal_;
        _presaleLimit = presaleLimit_;
        _saleLimit = saleLimit_;
        _payout = payout_;
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

    function inWhitelist(address value) internal view returns (bool) { return _whitelist.contains(value); }

    function startGiveaway() external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        giveawayActive = true;
        emit GiveawayStart(block.timestamp);
    }

    function pauseGiveaway() external onlyOwner whenPresalePaused whenSalePaused whenGiveawayActive {
        giveawayActive = false;
        emit GiveawayPaused(block.timestamp);
    }

    function startPresale() external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        presaleActive = true;
        emit PresaleStart(block.timestamp);
    }

    function pausePresale() external onlyOwner whenGiveawayPaused whenSalePaused whenPresaleActive {
        presaleActive = false;
        emit PresalePaused(block.timestamp);
    }

    function startPublicSale() external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        saleActive = true;
        emit SaleStart(block.timestamp);
    }

    function pausePublicSale() external onlyOwner whenGiveawayPaused whenPresalePaused whenSaleActive {
        saleActive = false;
        emit SalePaused(block.timestamp);
    }

    function price() external view whenAnySaleActive returns (uint256) {
        if (giveawayActive) { return giveawayPriceToMint; }
        else if (presaleActive) { return presalePriceToMint; }
        else { return priceToMint; }
    }

    function mintTokens(uint256 tokensAmount, string[] calldata tokenHashes) external payable whenAnySaleActive nonReentrant returns (uint256[] memory) {
        _preValidatePurchase(tokensAmount, tokenHashes);
        uint256[] memory tokens = new uint256[](tokensAmount);
        for (uint index = 0; index < tokensAmount; index += 1) { tokens[index] = _processMint(msg.sender); }
        for (uint index = 0; index < tokensAmount; index += 1) { _setTokenURI(tokens[index], tokenHashes[index]); }

        if (presaleActive || saleActive) { purchasedAmount[msg.sender] += tokensAmount; } 

        return tokens;
    }

    function _processMint(address recipient) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        return newItemId;
    }

    function _preValidatePurchase(uint256 tokensAmount, string[] calldata tokenHashes) internal view {
        require(msg.sender != address(0));
        require(tokenHashes.length == tokensAmount, "Abort: tokens requested is not equal to files uploaded.");
        require(_tokenIds.current() < _maxSupply, "No tokens left!");
        require(tokensAmount > 0, "Must mint at least one token");
        require(tokensAmount <= 4, "Cannot mint more than 4 tokens at a time");
        if (giveawayActive) {
            require(inWhitelist(msg.sender), "We're sorry, your address isn't whitelisted");
        } else if (presaleActive) {
            require(inWhitelist(msg.sender), "We're sorry, your address isn't whitelisted");
            require(tokensAmount + purchasedAmount[msg.sender] <= _presaleLimit, "Cannot mint more than 4 tokens presale");
            require(presalePriceToMint * tokensAmount <= msg.value, "Insufficient funds: Ether value does not match presale price.");
        } else {
            require(tokensAmount + purchasedAmount[msg.sender] <= _saleLimit, "Cannot mint more than 16 tokens");
            require(priceToMint * tokensAmount <= msg.value, "Insufficient funds: Ether value does not match public sale price.");
        }
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseTokenURI;
        
        if (bytes(base).length == 0) { return _tokenURI; }
        if (bytes(_tokenURI).length > 0) { return string(abi.encodePacked(base, _tokenURI)); }

        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function withdraw() external onlyOwner nonReentrant {
        require(_maxWithdrawal <= address(this).balance, "Balance is less than .5 eth");
        require(_payout != address(0));
        _payout.transfer(_maxWithdrawal);
    }
    
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(_tokenId), "Nonexistent token for royalty payment");
        require(_payout != address(0));
        return (_payout, (_salePrice * 800) / 10000);
    } 
}