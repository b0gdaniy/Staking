// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Update for {ERC20} from
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol
 * Added 2 public functions {mint} and {burn} that called 2 internal functions {_mint} and {_burn}
 */
contract ERC20Updated is ERC20 {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function mint(address account, uint256 amount) public virtual {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public virtual {
        _burn(account, amount);
    }
}
