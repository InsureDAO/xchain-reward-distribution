// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

library Deploy {
    function deployCode(bytes memory code) internal returns (address addr) {
        assembly {
            addr := create(0, add(code, 0x20), mload(code))
        }
        require(addr.code.length != 0, 'deploy failed');
    }

    function deployCode(bytes memory code, bytes memory data) internal returns (address addr) {
        bytes memory _code = abi.encodePacked(code, data);

        assembly {
            addr := create(0, add(_code, 0x20), mload(_code))
        }

        require(addr.code.length != 0, 'deploy failed');
    }
}
