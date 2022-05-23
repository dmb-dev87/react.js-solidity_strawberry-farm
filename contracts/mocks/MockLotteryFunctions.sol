// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../BuddhaNft.sol";
import "../StrawberryToken.sol";

contract MockLotteryFunctions is Ownable, VRFConsumerBase {
    uint256 private lotteryPool;
    uint256 public lotteryCount;
    uint256 internal fee;
    bytes32 internal keyHash;

    BuddhaNft public buddhaNft;
    StrawberryToken public sbtToken;
    IERC20 public linkToken;

    mapping(uint256 => uint256) public winningNumber;

    mapping(bytes32 => uint256) public requestIdToCount;

    event LotteryStart(
        uint256 indexed _lotteryCount,
        bytes32 indexed _requestId
    );
    event NumberReceived(
        bytes32 indexed _requestId,
        uint256 indexed _winningNumber
    );
    event LotteryClaim(address indexed winner, uint256 indexed amount);
    event AddSbt(address indexed from, uint256 indexed amount);
    event WithdrawLink(address indexed from, uint256 indexed amount);

    constructor(
        BuddhaNft _buddhaNft,
        StrawberryToken _sbtToken,
        IERC20 _linkToken,
        address _coorAddress,
        address _linkAddress,
        uint256 _fee,
        bytes32 _keyHash
    ) VRFConsumerBase(_coorAddress, _linkAddress) {
        buddhaNft = _buddhaNft;
        sbtToken = _sbtToken;
        linkToken = _linkToken;
        fee = _fee;
        keyHash = _keyHash;
    }

    function getWinningNumber() public onlyOwner {
        bytes32 requestId = getRandomNumber();
        requestIdToCount[requestId] = lotteryCount;
        emit LotteryStart(lotteryCount, requestId);
        lotteryCount++;
    }

    function getRandomNumber() internal returns (bytes32 requestId) {
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness)
        internal
        override
    {
        uint256 totalIds = buddhaNft.getTotalSupply();
        uint256 winningNum = (_randomness % totalIds) + 1;
        winningNumber[requestIdToCount[_requestId]] = winningNum;
        emit NumberReceived(_requestId, winningNum);
    }

    function addToLotteryPool(address from, uint256 sbt) public {
        require(sbt > 0, "Cannot add zero");
        lotteryPool += sbt;
        sbtToken.transferFrom(from, address(this), sbt);
        emit AddSbt(msg.sender, sbt);
    }

    function validateWinner(address user) internal view returns (bool) {
        uint256 totalNfts = buddhaNft.balanceOf(user);
        uint256 winNum = winningNumber[lotteryCount - 1];
        for (uint256 i; i < totalNfts; i++) {
            if (buddhaNft.tokenOfOwnerByIndex(user, i) == winNum) {
                return true;
            }
        }

        return false;
    }

    function claimLottoWinnings() public {
        require(
            validateWinner(msg.sender) && lotteryPool > 0,
            "You either did not win or nothing in lotteryPool"
        );
        uint256 toTransfer = lotteryPool;
        lotteryPool = 0;
        sbtToken.transfer(msg.sender, toTransfer);
        emit LotteryClaim(msg.sender, toTransfer);
    }

    function withdrawLink() public onlyOwner {
        uint256 toTransfer = linkToken.balanceOf(address(this));
        linkToken.transfer(msg.sender, toTransfer);
        emit WithdrawLink(msg.sender, toTransfer);
    }

    function getLinkBalance() public view returns (uint256) {
        return linkToken.balanceOf(address(this));
    }

    bytes32 public __requestId = keccak256("5");

    function testGetWinningNumber0() public {
        requestIdToCount[__requestId] = lotteryCount;
        testFulfillRandomness(__requestId, 0);
        emit LotteryStart(lotteryCount, __requestId);
        lotteryCount++;
    }

    function testGetWinningNumber() public {
        requestIdToCount[__requestId] = lotteryCount;
        testFulfillRandomness(__requestId, 99);
        emit LotteryStart(lotteryCount, __requestId);
        lotteryCount++;
    }

    function testFulfillRandomness(bytes32 __RequestId, uint256 _randomness)
        public
    {
        uint256 totalIds = buddhaNft.getTotalSupply();
        uint256 winningNum = (_randomness % totalIds);
        winningNumber[requestIdToCount[__RequestId]] = winningNum;
        emit NumberReceived(__RequestId, winningNum);
    }
}
