// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './Deployment.sol';

contract TestXchainReward is DeploymentSetUp {
    function setUp() public {
        vm.selectFork(mainnetForkID);
        deal(address(L1_INSURE), alice, 10000e18);
        vm.selectFork(arbitrumForkID);
        deal(address(altInsure), alice, 10000e18);
        deal(ARB_USDC, alice, 10000e6);
    }

    function testXchainInsureEmissionArbitrum() public {
        vm.selectFork(arbitrumForkID);
        address _gmx = arbGauges[0];
        // deposit 1000 USDC to the GMX market
        vm.startPrank(alice);
        IERC20(ARB_USDC).approve(ARB_VAULT, type(uint).max);
        uint _lp = IMarketTemplate(MKT_GMX).deposit(1000e6);
        // stake lp token to the GMX gauge
        IERC20(MKT_GMX).approve(_gmx, type(uint).max);
        vm.breakpoint('a');
        IChildGauge(_gmx).deposit(_lp);

        vm.selectFork(mainnetForkID);
        uint _nextYear = block.timestamp + 365 days;
        VOTING_ESCROW.create_lock(1000e18, _nextYear);
        // Use half of the voting power for GMX gauge
        // GAUGE_CONTROLLER.vote_for_gauge_weights(_gmx, 5000);
        // assertEq(
        //     GAUGE_CONTROLLER.gauge_relative_weight(_gmx, block.timestamp),
        //     0
        // );
        // skip(7 days);
        // assertGt(
        //     GAUGE_CONTROLLER.gauge_relative_weight(_gmx, block.timestamp),
        //     0
        // );
    }
}
