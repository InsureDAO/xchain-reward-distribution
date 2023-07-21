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
        IERC20 _arbUSDC = IERC20(ARB_USDC);
        IMarketTemplate _mktGmx = IMarketTemplate(MKT_GMX);
        IInsureToken _insure = IInsureToken(L1_INSURE);
        IVotingEscrow _ve = IVotingEscrow(VOTING_ESCROW);
        IGaugeController _gc = IGaugeController(GAUGE_CONTROLLER);

        vm.selectFork(arbitrumForkID);
        address _gmx = arbGauges[0];
        IRootGauge _rgGmx = IRootGauge(_gmx);
        IChildGauge _cgGmx = IChildGauge(_gmx);
        // deposit 1000 USDC to the GMX market
        vm.startPrank(alice);
        _arbUSDC.approve(ARB_VAULT, type(uint).max);
        uint _lp = _mktGmx.deposit(1000e6);
        // stake lp token to the GMX gauge
        IERC20(MKT_GMX).approve(_gmx, type(uint).max);
        _cgGmx.deposit(_lp);

        vm.selectFork(mainnetForkID);
        _insure.approve(address(VOTING_ESCROW), type(uint).max);
        uint _nextYear = block.timestamp + 365 days;
        _ve.create_lock(1000e18, _nextYear);
        // Use half of the voting power for GMX gauge
        // * NOTES: second parameter is the share of the voting power. 10000 means 100%
        _gc.vote_for_gauge_weights(_gmx, 5000);
        assertEq(_gc.gauge_relative_weight_write(_gmx, 0), 0, 'gauge weight should be zero');
        // * NOTES: The parameter of user_checkpoint is not used in the function (just for the backward compatibility)
        // * The user_checkpoint function is used to update the total_emission for the Child gauge
        _rgGmx.user_checkpoint(address(0));
        // * NOTES: Root Gauge does not have share calculation mechanism. it only has total_emission for the Child gauge
        // * Giving the address other than the Root gauge always returns 0 (e.g. user's address)
        assertEq(_rgGmx.integrate_fraction(_gmx), 0, 'total emissions should be zero');
        // * NOTES: Vote will be counted after 2 weeks because Root gauges ignore latest week
        skip(14 days);
        assertGt(_gc.gauge_relative_weight_write(_gmx, 0), 0, 'gauge weight should be increased');
        _rgGmx.user_checkpoint(address(0));
        assertGt(_rgGmx.integrate_fraction(_gmx), 0, 'total emissions should be increased');

        // transmit emissions to the Child Gauge
        // * NOTES: transmit_emissions() must be called to the RootGaugeFactory(not the RootGauge itself)
        arbRootGaugeFactory.transmit_emissions(_gmx);
    }
}
