// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import './Deployment.sol';

contract TestXchainReward is DeploymentSetUp {
    function setUp() public {}

    function testFoo() public {
        assertEq(L1_OWNERSHIP.owner(), admin);
    }
}
