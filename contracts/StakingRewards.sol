//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IStakingRewards.sol";
import "./ERC20Updated.sol";

/**
 * @title Staking Rewards contract
 * @author Bohdan Pukhno
 * @dev StakingRewards contract that have built on staking rewards algorithmrewardPerToken.
 * We have 3 tokens: one of them is a token that farms itself, 2 other tokens farm a token that farms itself.
 */
contract StakingRewards is Ownable, IStakingRewards {
    /// @dev Emitted when the user submits some amount of tokens to Staking.
    event Deposit(
        address indexed sender,
        address indexed tokenAddr,
        uint256 amount
    );
    /// @dev Emitted when the user withdraws some amount of tokens from Staking.
    event Withdraw(
        address indexed to,
        address indexed tokenAddr,
        uint256 amount
    );
    /// @dev Emitted when the user withdraws some amount of rewards from Staking.
    event RewardSent(address indexed to, uint256 amount);

    ERC20Updated immutable tokenOne; // token that farms {selfFarmToken}
    ERC20Updated immutable tokenTwo; // token that farms {selfFarmToken}
    ERC20Updated immutable selfFarmToken; // token that farms itself

    struct User {
        uint256 balance; // balance of user
        uint256 reward; // reward the user earns
        uint256 rewardPerToken; // reward per token
        ERC20Updated token; // user's token
    }

    mapping(address => User) public users;

    uint256 public duration = 7 days; // duration of rewards to be paid out (in seconds) - 7 days as default
    uint256 public finishAt; // timestamp of when the rewards finish
    uint256 public updatedAt; // minimum of last updated time and reward finish time

    uint256 public rewardRate; // how many reward given to user / second
    uint256 public rewardPerTokenStored; // sum of (rewardRate * duration * 1e18 / total supply)

    uint256 public totalSupply; // total stacked tokens

    /// @dev Throws if amount sent less or equal to zero
    modifier gtZero(uint256 _amount) {
        require(_amount > 0, "AMOUNT IS <= 0");
        _;
    }

    /**
     * @dev Updates the `rewardPerTokenStored` and `lastUpdateTime`.
     * Then updates {users[_staker].reward}.
     */
    modifier updateReward(address _staker) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = _min(finishAt, block.timestamp);

        if (_staker != address(0)) {
            users[_staker].reward = earned(_staker);
            users[_staker].rewardPerToken = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Initializes the contract, setting the deployer as the initial owner.
     * Setting the token contracts addresses by the parameters passed to it.
     */
    constructor(
        address _selfFarmToken,
        address _tokenOne,
        address _tokenTwo
    ) Ownable() {
        selfFarmToken = ERC20Updated(_selfFarmToken);
        tokenOne = ERC20Updated(_tokenOne);
        tokenTwo = ERC20Updated(_tokenTwo);
    }

    /**
     * @dev See {IStakingRewards-setRewardAmount}.
     */
    function setRewardAmount(uint256 _amount)
        external
        gtZero(_amount)
        onlyOwner
        updateReward(address(0))
    {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "REWARD_RATE <= 0");
        require(
            rewardRate * duration <= selfFarmToken.balanceOf(address(this)),
            "REWARD AMOUNT > BALANCE"
        );

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    /**
     * @dev See {IStakingRewards-setDuration}.
     */
    function setDuration(uint256 _duration) public gtZero(_duration) onlyOwner {
        require(finishAt < block.timestamp, "REWARD DURATION IS NOT FINISHED");
        duration = _duration;
    }

    /**
     * @dev See {IStakingRewards-stake}.
     */
    function stake(address _tokenAddr, uint256 _amount)
        public
        gtZero(_amount)
        updateReward(msg.sender)
    {
        require(_tokenAddr != address(0), "TOKEN_ADDRESS IS ZERO ADDRESS");

        User storage user = users[msg.sender];

        user.token = ERC20Updated(_tokenAddr);

        user.token.transferFrom(msg.sender, address(this), _amount);

        user.balance += _amount;
        totalSupply += _amount;

        emit Deposit(msg.sender, address(user.token), _amount);
    }

    /**
     * @dev See {IStakingRewards-withdraw}.
     */
    function withdraw(uint256 _amount)
        public
        gtZero(_amount)
        updateReward(msg.sender)
    {
        User storage user = users[msg.sender];

        user.token.transfer(msg.sender, _amount);

        user.balance -= _amount;
        totalSupply -= _amount;

        emit Withdraw(msg.sender, address(user.token), _amount);
    }

    /**
     * @dev See {IStakingRewards-getRewards}.
     */
    function getRewards() public updateReward(msg.sender) {
        uint256 reward = users[msg.sender].reward;
        if (reward > 0) {
            users[msg.sender].reward = 0;
            selfFarmToken.transfer(msg.sender, reward);
        }
    }

    /**
     * @dev Calculate the number of tokens earned by the sender.
     */
    function earned(address _sender) public view returns (uint256) {
        return
            ((users[_sender].balance *
                (rewardPerToken() - users[_sender].rewardPerToken)) / 1e18) +
            users[_sender].reward;
    }

    /**
     * @dev Calculate the reward to users per token.
     */
    function rewardPerToken() private view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (rewardRate *
                (_min(finishAt, block.timestamp) - updatedAt) *
                1e18) /
            totalSupply;
    }

    /**
     * @dev Calculate the minimum of `x` and `y`.
     */
    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
