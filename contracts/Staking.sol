//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20.sol";

/**
 * @title Staking rewards interface
 * @author Bohdan Pukhno
 * @dev Interface of the StakingRewards contract that have built on staking rewards algorithm
 */
interface IStakingRewards {
    /// @dev Emitted when the user submits some amount of tokens to Staking
    event Deposit(
        address indexed sender,
        address indexed tokenAddr,
        uint256 amount
    );
    /// @dev Emitted when the user withdraws some amount of tokens from Staking
    event Withdraw(
        address indexed to,
        address indexed tokenAddr,
        uint256 amount
    );
    /// @dev Emitted when the user withdraws some amount of rewards from Staking
    event RewardSent(address indexed to, uint256 amount);

    /**
     * @dev Entering staking with the selected token {_tokenAddr} that the user wants to stake
     * and the amount {_amount} of tokens he wants to deposit
     *
     * REQUIREMENTS:
     * - {_amount} must be grater then zero
     * - {_tokenAddr} must be different from address 0
     */
    function stake(address _tokenAddr, uint256 _amount) external;

    /**
     * @dev Withdrawing staking token {_tokenAddr} that the user staked
     * and the amount {_amount} of tokens he wants to withdraw
     *
     * REQUIREMENTS:
     * - {_amount} must be grater then zero
     */
    function withdraw(uint256 _amount) external;

    /**
     * @dev Receiving the rewards {reward} that the user received for some time spent in staking
     *
     * REQUIREMENTS:
     * - {reward} must be grater then zero
     */
    function getRewards() external;

    /**
     * @dev Exiting staking with withdrawing staking token {_tokenAddr} that the user staked
     * and receiving the rewards {reward} that the user received for some time spent in staking
     *
     * REQUIREMENTS:
     * - {_amount} must be grater then zero
     * - {reward} must be grater then zero
     */
    function exitStaking() external;
}

/**
 * @title Staking rewards contract
 * @author Bohdan Pukhno
 * @dev StakingRewards contract that have built on staking rewards algorithm
 * We have 3 tokens: one of them is a token that farms itself, 2 other tokens farm a token that farms itself
 */
contract StakingRewards is Ownable, IStakingRewards {
    ERC20Updated public tokenOne; // token that farms {selfFarmToken}
    ERC20Updated public tokenTwo; // token that farms {selfFarmToken}
    ERC20Updated public selfFarmToken; // token that farms itself

    struct User {
        uint256 balance; // balance of user
        uint256 rewards; // rewards the user earns
        uint256 rewardPerTokenPaid; // reward per token
        address token; // user's token
    }

    mapping(address => User) public users;

    uint256 public lastUpdateTime; // when was the contract last updated
    uint256 public rewardRate = 1000; // how many rewards given to user / second
    uint256 public rewardPerTokenStored; // sum of (rewardRate * duration * 1e18 / total supply)

    uint256 public totalSupply; // total stacked tokens

    /// @dev Throws if amount sent less or equal to zero
    modifier amountGTZero(uint256 _amount) {
        require(_amount > 0, "amount is <= 0");
        _;
    }

    /**
     * @dev Updates the {rewardPerTokenStored} and {lastUpdateTime}
     * Then updates user's rewards {user.rewards}
     */
    modifier updateReward(address _staker) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        User storage user = users[_staker];

        user.rewards = earned(_staker);
        user.rewardPerTokenPaid = rewardPerTokenStored;

        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner
     * Setting the token contracts addresses by the parameters passed to it
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

    function stake(address _tokenAddr, uint256 _amount)
        public
        amountGTZero(_amount)
        updateReward(msg.sender)
    {
        require(_tokenAddr != address(0), "zero address");

        User storage user = users[msg.sender];

        user.token = _tokenAddr;

        user.balance += _amount;
        totalSupply += _amount;

        ERC20Updated(user.token).transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        emit Deposit(msg.sender, user.token, _amount);
    }

    function withdraw(uint256 _amount)
        public
        amountGTZero(_amount)
        updateReward(msg.sender)
    {
        User storage user = users[msg.sender];

        user.balance -= _amount;
        totalSupply -= _amount;

        ERC20Updated(user.token).transfer(msg.sender, _amount);

        emit Withdraw(msg.sender, user.token, _amount);
    }

    function getRewards()
        public
        amountGTZero(users[msg.sender].rewards)
        updateReward(msg.sender)
    {
        uint256 reward = users[msg.sender].rewards;

        users[msg.sender].rewards = 0;

        selfFarmToken.transfer(msg.sender, reward);
    }

    function exitStaking() external updateReward(msg.sender) {
        withdraw(users[msg.sender].balance);
        getRewards();
    }

    /// @dev Calculate the number of tokens earned by the sender
    function earned(address _sender) public view returns (uint256) {
        User memory user = users[_sender];
        return
            ((user.balance * (rewardPerToken() - user.rewardPerTokenPaid)) /
                1e18) + user.rewards;
    }

    /// @dev Calculate the reward to users per token
    function rewardPerToken() private view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (rewardRate * (block.timestamp - lastUpdateTime) * 1e18) /
            totalSupply;
    }
}

//1000000000000000000000
