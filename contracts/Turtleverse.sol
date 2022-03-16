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
    using EnumerableSet for EnumerableSet.AddressSet;

    string private _baseTokenURI;
    mapping (uint256 => string) private _tokenURIs;

    Counters.Counter private _tokenIds;

    EnumerableSet.AddressSet private _giveawayList;
    event AddedToGiveawayList(address indexed _address);

    EnumerableSet.AddressSet private _whitelist;
    event AddedToWhitelist(address indexed _address);
    event RemovedFromWhitelist(address indexed _address);
    
    uint256 public giveawayPriceToMint = 0 ether;
    uint256 public presalePriceToMint = .025 ether;
    uint256 public priceToMint = .05 ether;

    bool public giveawayActive;
    bool public presaleActive;
    bool public saleActive;
    bool public royaltiesActive;

    uint8 public presaleLimit;
    mapping(address => uint) public presalePurchasedAmount; 

    uint8 public saleLimit;
    mapping(address => uint) public salePurchasedAmount;

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
        bool royaltiesActive_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;
        royaltiesActive = royaltiesActive_;
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

    function inWhitelist(address value) public view returns (bool) { return _whitelist.contains(value); }
    function inGiveawayList(address value) public view returns (bool) { return _giveawayList.contains(value); }

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

    function startPublicSale(uint8 saleLimit_) external onlyOwner whenGiveawayPaused whenPresalePaused whenSalePaused {
        saleLimit = saleLimit_;
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

    function mintTokens(uint256 tokensAmount, string[] calldata tokenHashes) external payable whenAnySaleActive nonReentrant returns (uint256[] memory) {
        _preValidatePurchase(tokensAmount);
        uint256[] memory tokens = new uint256[](tokensAmount);
        for (uint index = 0; index < tokensAmount; index += 1) { tokens[index] = _processMint(msg.sender, tokenHashes[index]); }

        if (presaleActive) { presalePurchasedAmount[msg.sender] += tokensAmount; } 
        else if (saleActive) { salePurchasedAmount[msg.sender] += tokensAmount; }

        return tokens;
    }

    function _preValidatePurchase(uint256 tokensAmount) internal view {
        require(msg.sender != address(0));
        require(tokensAmount > 0, "Must mint at least one token");
        if (giveawayActive) {
            require(inGiveawayList(msg.sender), "Address isn't whitelisted");
        } else if (presaleActive) {
            require(inWhitelist(msg.sender), "Address isn't whitelisted");
            require(tokensAmount + presalePurchasedAmount[msg.sender] <= presaleLimit, "Presale, limited amount of tokens");
            require(presalePriceToMint * tokensAmount <= msg.value, "Presale, insufficient funds");
        } else {
            require(tokensAmount + salePurchasedAmount[msg.sender] <= saleLimit, "Cannot mint more than 25 tokens");
            require(priceToMint * tokensAmount <= msg.value, "Insufficient funds");
        }
    }

    function _processMint(address recipient, string memory tokenHash) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        mintTurtle(recipient, newItemId, tokenHash);
        return newItemId;
    }

    function mintTurtle(
        address _to,
        uint256 _tokenId,
        string memory tokenURI_
    ) internal {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, tokenURI_);
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

    function withdraw(address payable wallet, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Balance is less than .5 eth");
        wallet.transfer(amount);
    }

    function tglRoyalties() external onlyOwner { royaltiesActive = !royaltiesActive; }
    
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(_tokenId), "Nonexistent token for royalty payment");
        require(royaltiesActive == true, "Royalties dissabled");

        return (address(this), (_salePrice * 1000) / 10000);
    } 
}