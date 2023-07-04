// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface IRootGaugeFactory {
    function owner() external returns (address);

    function call_proxy() external returns (address);

    function transmit_emissions(address _gauge) external;

    function deploy_gauge(
        uint _chain_id,
        bytes32 _salt
    ) external returns (address);

    function deploy_child_gauge(
        uint _chain_id,
        address _lp_token,
        bytes32 _salt
    ) external;

    function set_bridger(uint _chain_id, address _bridger) external;

    function set_implementation(address _implementation) external;

    function set_call_proxy(address _new_call_proxy) external;

    function commit_transfer_ownership(address _future_owner) external;
}
