// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import 'forge-std/Test.sol';
import 'utils/VyperDeployer.sol';
import 'src/interfaces/IRootGaugeFactory.sol';
import 'dao-contracts/InsureToken.sol';

contract TestXChainReward is Test {
    address constant INSRUE = 0xD533a949740bb3306d119CC777fa900bA034cd52;
    address constant GAUGE_CONTROLLER =
        0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB;
    address constant MINTER = 0xd061D61a4d941c39E5453435B6345Dc261C2fcE0;
    address constant VE = 0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2;
    address constant ANYCALL = 0x37414a8662bC1D25be3ee51Fb27C2686e2490A89;

    IRootGaugeFactory public rootGaugeFactory;
    InsureToken public insure;
    address public alice = vm.addr(0xa11ce);

    function testDeployGauge() public {
        VyperDeployer deployer = new VyperDeployer();

        rootGaugeFactory = IRootGaugeFactory(
            deployer.deployContract(
                'RootGaugeFactory',
                abi.encode(ANYCALL, alice)
            )
        );

        console.log('alice address: %s', address(alice));
        console.log('gauge factory address: %s', address(rootGaugeFactory));
        console.log('gauge factory owner: %s', rootGaugeFactory.owner());
        console.log(
            'gauge factory call proxy: %s',
            rootGaugeFactory.call_proxy()
        );

        insure = new InsureToken('Insure token', 'INSURE', alice);
        console.log('insure address: %s', address(insure));
        console.log('symbol: %s', insure.symbol());
    }
}
