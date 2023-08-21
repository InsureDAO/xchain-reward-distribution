// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract RewardToken is ERC20, ERC20Burnable {
    constructor() ERC20('RewardToken', 'RWD') {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /// @notice Anyone can mint tokens for testing purposes. Do not use in production.
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
