// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

interface IGaugeController {
    function gauge_types(address _addr) external view returns (uint256);

    function get_voting_escrow() external view returns (address);

    function checkpoint_gauge(address addr) external;

    function gauge_relative_weight(
        address addr,
        uint256 time
    ) external view returns (uint256);

    function add_gauge(
        address _addr,
        uint256 _gauge_type,
        uint256 _weight
    ) external;

    function vote_for_gauge_weights(
        address _gauge_addr,
        uint256 _user_weight
    ) external;
}
