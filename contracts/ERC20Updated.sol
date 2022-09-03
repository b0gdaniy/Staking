// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20 Updated contract
 * @author Bohdan Pukhno
 * @dev Update for {ERC20} from
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol .
 * Added 2 public functions {mint} and {burn} that called 2 internal functions {_mint} and {_burn}.
 */
contract ERC20Updated is ERC20, Ownable {
    /**
     * @dev Initializes the contract. Sets the ERC20 token's `_name` and `_symbol`.
     */
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    /**
     * @dev Call the internal {ERC20-_mint} function with {account} and {amount}.
     *
     * REQUIREMENTS:
     * - `msg.sender` must be owner
     */
    function mint(address account, uint256 amount) public virtual onlyOwner {
        _mint(account, amount);
    }

    /**
     * @dev Call the internal {ERC20-_burn} function with {account} and {amount}.
     *
     * REQUIREMENTS:
     * - `msg.sender` must be owner
     */
    function burn(address account, uint256 amount) public virtual onlyOwner {
        _burn(account, amount);
    }
}
