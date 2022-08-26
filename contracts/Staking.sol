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

    /// @dev Enters the staking
    function stake(
        address _from,
        address _tokenAddr,
        uint256 _amount
    ) external;

    /// @dev Exits the staking
    function exitStaking() external;

    /// @dev Withdraw tokens that have been added to staking
    function withdraw(address _to, uint256 _amount) external;

    /// @dev Receiving rewards after the deposited tokens have been stacked
    function getRewards(address _to) external;
}

/**
 * @title Staking rewards contract
 * @author Bohdan Pukhno
 * @dev StakingRewards contract that have built on staking rewards algorithm
 * We have 3 tokens: one of them is a token that farms itself, 2 other tokens farm a token that farms itself
 */
contract StakingRewards is Ownable, IStakingRewards {
    ERC20Update public tokenOne; // token that farms {selfFarmToken}
    ERC20Update public tokenTwo; // token that farms {selfFarmToken}
    ERC20Update public selfFarmToken; // token that farms itself

    struct User {
        uint256 balance; // balance of user
        uint256 rewards; // rewards the user earns
        uint256 rewardPerTokenPaid; // reward per token
        address token; // user's token
    }

    mapping(address => User) public users;

    uint256 public rewardsDuration; // Duration of rewards to be paid out (in seconds)
    uint256 public rewardRate = 1000; // how many rewards given to user / second

    uint256 public finishAt; // timestamp of when the rewards finish
    uint256 public lastUpdateTime; // when was the contract last updated

    uint256 public rewardPerTokenStored; // sum of (rewardRate * duration * 1e18 / total supply)

    uint256 public totalSupply; // total stacked tokens

    /// @dev Throws if amount sent less or equal to zero
    modifier amountGTZero(uint256 _amount) {
        require(_amount > 0, "amount is <= 0");
        _;
    }

    /// @dev
    modifier updateReward(address _staker) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();

        User storage user = users[_staker];

        if (_staker != address(0)) {
            user.rewards = earned(_staker);
            user.rewardPerTokenPaid = rewardPerTokenStored;
        }

        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner
     * Setting the token contracts addresses by the parameters passed to it
     */
    constructor(
        address _selfFarmToken,
        address _tokenOne,
        address _tokenTwo,
        uint256 duration
    ) Ownable() {
        selfFarmToken = ERC20Update(_selfFarmToken);
        tokenOne = ERC20Update(_tokenOne);
        tokenTwo = ERC20Update(_tokenTwo);

        rewardsDuration = duration;
    }

    function notifyRewardAmount(uint256 _amount)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / rewardsDuration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;
            rewardRate = (_amount + remainingRewards) / rewardsDuration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * rewardsDuration <=
                selfFarmToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        finishAt = block.timestamp + rewardsDuration;
        lastUpdateTime = block.timestamp;
    }

    function stake(
        address _from,
        address _tokenAddr,
        uint256 _amount
    ) public amountGTZero(_amount) updateReward(_from) {
        require(_tokenAddr != address(0), "zero address");

        User storage user = users[_from];

        user.token = _tokenAddr;

        user.balance += _amount;
        totalSupply += _amount;

        ERC20(user.token).transferFrom(_from, address(this), _amount);

        selfFarmToken.mint(_from, _amount);

        emit Deposit(_from, user.token, _amount);
    }

    function withdraw(address _to, uint256 _amount)
        public
        amountGTZero(_amount)
        updateReward(_to)
    {
        User storage user = users[_to];

        user.balance -= _amount;
        totalSupply -= _amount;

        ERC20(user.token).transfer(_to, _amount);

        emit Withdraw(_to, user.token, _amount);
    }

    function getRewards(address _to)
        public
        amountGTZero(users[_to].rewards)
        updateReward(_to)
    {
        uint256 reward = users[_to].rewards;

        users[_to].rewards = 0;

        selfFarmToken.transfer(_to, reward);
    }

    function exitStaking() external updateReward(msg.sender) {
        selfFarmToken.burn(msg.sender, users[msg.sender].balance);

        withdraw(msg.sender, users[msg.sender].balance);
        getRewards(msg.sender);
    }

    /// @dev Calculate the number of tokens earned by the sender
    function earned(address _sender) public view returns (uint256) {
        User storage user = users[_sender];
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
            (rewardRate *
                (lastTimeRewardApplicable() - lastUpdateTime) *
                1e18) /
            totalSupply;
    }

    /// @dev Calculate the min of lastUpdateTime and timestamp
    function lastTimeRewardApplicable() private view returns (uint256) {
        return lastUpdateTime <= block.timestamp ? finishAt : block.timestamp;
    }
}

//1000000000000000000000
