// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRootGauge {
    function transmit_emissions() external;

    function integrate_fraction(address _user) external returns (uint);

    function user_checkpoint(address _user) external returns (bool);
}
