// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

contract Counter {
    uint256 public value;

    function increase() public {
        value += 1;
    }
}
