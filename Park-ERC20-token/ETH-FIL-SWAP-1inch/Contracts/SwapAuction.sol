// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SwapAuction {
    struct Auction {
        address maker;
        address tokenA; // Token offered by the maker (on this chain)
        uint256 amountA; // Amount of tokenA
        address tokenB; // Token desired by the maker (on the other chain)
        uint256 minAmountB; // Minimum amount of tokenB the maker will accept
        uint256 endTime;
        address highestBidder;
        uint256 highestBid; // The amount of tokenB offered
        bool ended;
    }

    uint256 public auctionCounter;
    mapping(uint256 => Auction) public auctions;

    event AuctionCreated(
        uint256 auctionId,
        address indexed maker,
        address indexed tokenA,
        uint256 amountA,
        address indexed tokenB,
        uint256 minAmountB,
        uint256 endTime
    );

    event BidPlaced(uint256 auctionId, address indexed bidder, uint256 amount);

    event AuctionEnded(
        uint256 auctionId,
        address indexed maker,
        address indexed taker,
        address tokenA,
        uint256 amountA,
        address tokenB,
        uint256 amountB
    );

    modifier notEnded(uint256 _auctionId) {
        require(block.timestamp < auctions[_auctionId].endTime, "Auction has already ended");
        _;
    }

    modifier onlyEnded(uint256 _auctionId) {
        require(block.timestamp >= auctions[_auctionId].endTime, "Auction has not ended yet");
        _;
    }

    function createAuction(
        address _tokenA,
        uint256 _amountA,
        address _tokenB,
        uint256 _minAmountB,
        uint256 _duration
    ) external {
        require(_amountA > 0, "Amount A must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        auctionCounter++;
        auctions[auctionCounter] = Auction({
            maker: msg.sender,
            tokenA: _tokenA,
            amountA: _amountA,
            tokenB: _tokenB,
            minAmountB: _minAmountB,
            endTime: block.timestamp + _duration,
            highestBidder: address(0),
            highestBid: 0,
            ended: false
        });

        emit AuctionCreated(auctionCounter, msg.sender, _tokenA, _amountA, _tokenB, _minAmountB, auctions[auctionCounter].endTime);
    }

    function bid(uint256 _auctionId, uint256 _amountB) external notEnded(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        require(_amountB > auction.highestBid, "Bid must be higher than current highest bid");
        require(_amountB >= auction.minAmountB, "Bid must be at least the minimum acceptable amount");

        auction.highestBidder = msg.sender;
        auction.highestBid = _amountB;

        emit BidPlaced(_auctionId, msg.sender, _amountB);
    }

    function endAuction(uint256 _auctionId) external onlyEnded(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        require(!auction.ended, "Auction has already been ended");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            emit AuctionEnded(
                _auctionId,
                auction.maker,
                auction.highestBidder,
                auction.tokenA,
                auction.amountA,
                auction.tokenB,
                auction.highestBid
            );
        }
    }
}
