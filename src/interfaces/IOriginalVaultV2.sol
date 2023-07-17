// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

// source: https://etherscan.io/address/0x7510792a3b1969f9307f3845ce88e39578f2bae1#code
interface IOriginalVaultV2 {
    function setMinDeposit(
        address[] calldata _tokens,
        uint256[] calldata _amounts
    ) external;

    function setMaxDeposit(
        address[] calldata _tokens,
        uint256[] calldata _amounts
    ) external;
}
