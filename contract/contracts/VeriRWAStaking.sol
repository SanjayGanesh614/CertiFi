// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VeriRWAStaking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken; // OG token (0G Network native token)
    uint256 public constant ANNUAL_REWARD_RATE = 1200; // 12% APY in basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardTimestamp;
        uint256 accumulatedRewards;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public validators;

    uint256 public totalStaked;
    uint256 public rewardPool;
    uint256 public minimumStake = 1000 * 10**18; // 1000 tokens minimum

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ValidatorStatusChanged(address indexed validator, bool status);
    event RewardPoolFunded(uint256 amount);

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount >= minimumStake, "Below minimum stake");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        StakeInfo storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            _updateRewards(msg.sender);
        } else {
            userStake.timestamp = block.timestamp;
            userStake.lastRewardTimestamp = block.timestamp;
        }

        userStake.amount += amount;
        totalStaked += amount;

        // Auto-qualify as validator if staking enough
        if (userStake.amount >= minimumStake * 10) { // 10x minimum = validator
            validators[msg.sender] = true;
            emit ValidatorStatusChanged(msg.sender, true);
        }

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");

        _updateRewards(msg.sender);

        userStake.amount -= amount;
        totalStaked -= amount;

        // Remove validator status if below threshold
        if (userStake.amount < minimumStake * 10) {
            validators[msg.sender] = false;
            emit ValidatorStatusChanged(msg.sender, false);
        }

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);

        StakeInfo storage userStake = stakes[msg.sender];
        uint256 rewards = userStake.accumulatedRewards;

        require(rewards > 0, "No rewards to claim");
        require(rewardPool >= rewards, "Insufficient reward pool");

        userStake.accumulatedRewards = 0;
        rewardPool -= rewards;

        require(stakingToken.transfer(msg.sender, rewards), "Transfer failed");

        emit RewardsClaimed(msg.sender, rewards);
    }

    function _updateRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];

        if (userStake.amount == 0) return;

        uint256 timeElapsed = block.timestamp - userStake.lastRewardTimestamp;
        uint256 rewards = (userStake.amount * ANNUAL_REWARD_RATE * timeElapsed) /
                         (BASIS_POINTS * SECONDS_PER_YEAR);

        userStake.accumulatedRewards += rewards;
        userStake.lastRewardTimestamp = block.timestamp;
    }

    function calculatePendingRewards(address user) external view returns (uint256) {
        StakeInfo memory userStake = stakes[user];

        if (userStake.amount == 0) return userStake.accumulatedRewards;

        uint256 timeElapsed = block.timestamp - userStake.lastRewardTimestamp;
        uint256 newRewards = (userStake.amount * ANNUAL_REWARD_RATE * timeElapsed) /
                            (BASIS_POINTS * SECONDS_PER_YEAR);

        return userStake.accumulatedRewards + newRewards;
    }

    function fundRewardPool(uint256 amount) external {
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }

    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        minimumStake = _minimumStake;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(stakingToken.transfer(owner(), balance), "Transfer failed");
    }

    function getStakeInfo(address user) external view returns (StakeInfo memory) {
        return stakes[user];
    }

    function isValidator(address user) external view returns (bool) {
        return validators[user];
    }
}