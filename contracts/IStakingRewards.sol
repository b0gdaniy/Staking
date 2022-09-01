//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title Staking rewards interface
 * @author Bohdan Pukhno
 * @dev Interface of the StakingRewards contract that have built on staking rewards algorithm.
 */
interface IStakingRewards {
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

    /**
     * @dev Updates the sum of (rewardRate * duration * 1e18 / total supply)
     * and minimum of last updated time and reward finish time after function call.
     * Sets the amount of the reward.
     *
     * REQUIREMENTS:
     * - `_amount` must be greater then zero
     * - `msg.sender` must be owner
     */
    function setRewardAmount(uint256 _amount) external;

    /**
     * @dev Sets the duration of the staking rewards process.
     *
     * REQUIREMENTS:
     * - `_duration` must be greater then zero
     * - `msg.sender` must be owner
     */
    function setDuration(uint256 _duration) external;

    /**
     * @dev Updates the reward to `msg.sender` after function call.
     * Entering staking with the selected `_tokenAddr` that the user wants to stake
     * and the `_amount` of tokens he wants to deposit.
     *
     * REQUIREMENTS:
     * - `_amount` must be greater then zero
     * - `_tokenAddr` must be different from address 0
     */
    function stake(address _tokenAddr, uint256 _amount) external;

    /**
     * @dev Updates the reward to `msg.sender` after function call.
     * Withdrawing staking `_tokenAddr` that the user staked
     * and the `_amount` of tokens he wants to withdraw.
     *
     * REQUIREMENTS:
     * - `_amount` must be greater then zero
     */
    function withdraw(uint256 _amount) external;

    /**
     * @dev Updates the reward to `msg.sender` after function call.
     * Receiving the `reward` that the user received for some time spent in staking.
     *
     * REQUIREMENTS:
     * - `reward` must be greater then zero
     */
    function getRewards() external;
}
