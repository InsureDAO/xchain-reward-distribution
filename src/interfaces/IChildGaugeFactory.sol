// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IChildGaugeFactory {
    function mint(address _gauge) external;

    function mint_many(address[32] calldata _gauges) external;

    function deploy_gauge(
        address _lp_token,
        bytes32 _salt
    ) external returns (address);

    function deploy_gauge(
        address _lp_token,
        bytes32 _salt,
        address _manager
    ) external returns (address);

    function set_implementation(address _implementation) external;

    function set_mirrored(address _gauge, bool _mirrored) external;
}
