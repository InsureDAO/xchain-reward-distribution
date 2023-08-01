// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IChildGauge {
    function deposit(uint _value) external;

    function deposit(uint _value, address _user) external;

    function deposit(uint _value, address _user, bool _claim_rewards) external;

    function withdraw(uint _value) external;

    function withdraw(uint _value, address _user) external;

    function withdraw(uint _value, address _user, bool _claim_rewards) external;

    function user_checkpoint(address _addr) external returns (bool);

    function claimable_tokens(address _addr) external returns (uint);

    function claimed_reward(address _addr, address _token) external returns (uint);

    function claimable_rewarad(address _user, address _reward_token) external returns (uint);

    function set_rewards_receiver(address _receiver) external;

    function claim_rewards() external;

    function claim_rewards(address _addr) external;

    function claim_rewards(address _addr, address _receiver) external;

    function add_reward(address _reward_token, address _distributor) external;

    function set_reward_distributor(address _reward_token, address _distributor) external;

    function deposit_reward_token(address _reward_token, uint _amount) external;
}
