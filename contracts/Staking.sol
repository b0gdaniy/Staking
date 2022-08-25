//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "./ERC20.sol";

/** 
 * @title Staking rewards interface
 * @author Bohdan Pukhno
 * @dev Interface of the StakingRewards contract that have built on staking rewards algorithm
 */
interface IStakingRewards {
    /// @dev Emitted when the user submits some amount of tokens to Staking
    event Deposit(address indexed sender, address indexed tokenAddr, uint amount);
    /// @dev Emitted when the user withdraws some amount of tokens from Staking
    event Withdraw(address indexed to, address indexed tokenAddr, uint amount);
    /// @dev Emitted when the user withdraws some amount of rewards from Staking
    event RewardSent(address indexed to, uint amount);

    /// @dev Enters the staking
    function stake(address _tokenAddr, uint _amount) external;
    /// @dev Exits the staking
    function exitStaking() external;

    /// @dev Withdraw tokens that have been added to staking
    function withdraw(uint _amount) external;
    /// @dev Receiving rewards after the deposited tokens have been stacked
    function getRewards() external;
} 

/** 
 * @title Staking rewards contract
 * @author Bohdan Pukhno
 * @dev StakingRewards contract that have built on staking rewards algorithm
 */
contract StakingRewards is Ownable, IStakingRewards {
    ERC20 public selfFarmToken; // token that farms itself
    ERC20 public farmingTokenOne; // token that farms selfFarmToken
    ERC20 public farmingTokenTwo; // token that farms selfFarmToken

    struct User {
        uint balance; // balance of user
        uint rewards; // rewards the user earns
        uint rewardPerTokenPaid; // reward per token
        address token; // user's token
    }

    mapping(address => User) public users;

    uint public lastUpdateTime; // when was the contract last updated
    uint public rewardRate = 1000; // how many rewards given to user / second
    uint public rewardPerTokenStored; // sum of (rewardRate * duration * 1e18 / total supply)

    uint public totalSupply; // total stacked tokens

    /// @dev Throws if amount sent less or equal to zero 
    modifier amountGTZero(uint _amount) {
        require(_amount > 0, "amount is <= 0");
        _;
    }

    modifier updateReward() {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();

        if (msg.sender != address(0)) {
            users[msg.sender].rewards = earned();
            users[msg.sender].rewardPerTokenPaid = rewardPerTokenStored;
        }

        // if(users[msg.sender].token == address(selfFarmToken)) {

        // }

        _;
    }
    
    /**
     * @dev Initializes the contract setting the deployer as the initial owner 
     * Setting the token contracts addresses by the parameters passed to it
     */
    constructor(address _selfFarmToken, address _farmingTokenOne, address _farmingTokenTwo){ //Ownable() {
        selfFarmToken = ERC20(_selfFarmToken);
        farmingTokenOne = ERC20(_farmingTokenOne);
        farmingTokenTwo = ERC20(_farmingTokenTwo);
    }

    function exitStaking() external updateReward {
        withdraw(users[msg.sender].balance);
        getRewards();
    }
1000000000000000000000
    /// @dev Start the staking
    function stake(address _tokenAddr, uint _amount) external amountGTZero(_amount) updateReward {
        require(_tokenAddr != address(0), "zero address");

        users[msg.sender].token = _tokenAddr;

        users[msg.sender].balance += _amount;
        totalSupply += _amount;
        ERC20(users[msg.sender].token).transferFrom(msg.sender, address(this), _amount);
    
        emit Deposit(msg.sender, users[msg.sender].token, _amount);
    }

    function withdraw(uint _amount) public amountGTZero(_amount) updateReward {
        users[msg.sender].balance -= _amount;
        totalSupply -= _amount;

        ERC20(users[msg.sender].token).transfer(msg.sender, _amount);
        
        emit Withdraw(msg.sender, users[msg.sender].token, _amount);
    }

    function getRewards() public updateReward {
        uint reward = users[msg.sender].rewards;

        users[msg.sender].rewards = 0;

        selfFarmToken.transfer(msg.sender, reward);
    }

    /// @dev Calculate the reward to users per token 
    function rewardPerToken() private view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - lastUpdateTime) * 1e18) /
            totalSupply;
    }

    /// @dev Calculate the min of lastUpdateTime and timestamp  
    function lastTimeRewardApplicable() private view returns (uint) {
        return lastUpdateTime <= block.timestamp ? lastUpdateTime : block.timestamp;
    }

    /// @dev Calculate the number of tokens earned by the sender
    function earned() public view returns (uint) {
        return(
            (users[msg.sender].balance *
                (rewardPerToken() - users[msg.sender].rewardPerTokenPaid)
            ) / 1e18) + users[msg.sender].rewards;
    }
}