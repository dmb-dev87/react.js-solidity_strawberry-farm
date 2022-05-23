// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StrawberryToken.sol";

contract StrawberryFarm {
    mapping(address => uint256) public stakingBalance;

    mapping(address => bool) public isStaking;

    mapping(address => uint256) public startTime;

    mapping(address => uint256) public sbtBalance;

    string public name = "SBT Farm";

    IERC20 public daiToken;
    StrawberryToken public sbtToken;

    event Stake(address indexed from, uint256 amount);

    event Unstake(address indexed from, uint256 amount);

    event YieldWithdraw(address indexed to, uint256 amount);

    constructor(IERC20 _daiToken, StrawberryToken _sbtToken) {
        daiToken = _daiToken;
        sbtToken = _sbtToken;
    }

    function stake(uint256 amount) public {
        require(
            amount > 0 && daiToken.balanceOf(msg.sender) >= amount,
            "You cannot stake zero tokens"
        );

        if (isStaking[msg.sender] == true) {
            uint256 toTransfer = calculateYieldTotal(msg.sender);
            sbtBalance[msg.sender] += toTransfer;
        }

        daiToken.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        startTime[msg.sender] = block.timestamp;
        isStaking[msg.sender] = true;
        emit Stake(msg.sender, amount);
    }

    function unstake(uint256 amount) public {
        require(
            isStaking[msg.sender] =
                true &&
                stakingBalance[msg.sender] >= amount,
            "Nothing to unstake"
        );

        uint256 yieldTransfer = calculateYieldTotal(msg.sender);
        startTime[msg.sender] = block.timestamp;
        uint256 balTransfer = amount;
        amount = 0;
        stakingBalance[msg.sender] -= balTransfer;
        daiToken.transfer(msg.sender, balTransfer);
        sbtBalance[msg.sender] += yieldTransfer;

        if (stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }

        emit Unstake(msg.sender, balTransfer);
    }

    function calculateYieldTime(address user) public view returns (uint256) {
        uint256 end = block.timestamp;
        uint256 totalTime = end - startTime[user];
        return totalTime;
    }

    function calculateYieldTotal(address user) public view returns (uint256) {
        uint256 time = calculateYieldTime(user) * 10**18;
        uint256 rate = 86400;
        uint256 timeRate = time / rate;
        uint256 rawYield = (stakingBalance[user] * timeRate) / 10**18;
        return rawYield;
    }

    function withdrawYield() public {
        uint256 toTransfer = calculateYieldTotal(msg.sender);

        require(
            toTransfer > 0 || sbtBalance[msg.sender] > 0,
            "Nothing to withdraw"
        );

        if (sbtBalance[msg.sender] != 0) {
            uint256 oldBalance = sbtBalance[msg.sender];
            sbtBalance[msg.sender] = 0;
            toTransfer += oldBalance;
        }

        startTime[msg.sender] = block.timestamp;
        sbtToken.mint(msg.sender, toTransfer);

        emit YieldWithdraw(msg.sender, toTransfer);
    }
}
