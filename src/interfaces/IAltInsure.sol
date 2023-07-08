// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IAltInsure {
    function mint(address _to, uint _amount) external;

    function burn(address _from, uint _amount) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
