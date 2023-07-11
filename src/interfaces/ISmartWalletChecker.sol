// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface ISmartWalletChecker {
    function setWhitelist(address _target, bool _bool) external;
}
