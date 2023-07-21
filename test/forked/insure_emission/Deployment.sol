// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import 'forge-std/Test.sol';
import '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';

import '../../shared/CreationCodes.sol';
import '../../shared/Mainnet.sol';
import '../../shared/Arbitrum.sol';
import '../../shared/Optimism.sol';

// dao contracts
import 'src/interfaces/IGaugeController.sol';
import 'src/interfaces/IInsureToken.sol';
import 'src/interfaces/IMinter.sol';
import 'src/interfaces/IOwnership.sol';
import 'src/interfaces/IVotingEscrow.sol';
import 'src/interfaces/ISmartWalletChecker.sol';

// pool contracts
import 'src/interfaces/IVault.sol';
import 'src/interfaces/IRegistry.sol';
import 'src/interfaces/IUniversalPool.sol';
import 'src/interfaces/IMarketTemplate.sol';
import 'src/interfaces/IFactory.sol';
import 'src/interfaces/IParameters.sol';
import 'src/interfaces/IPremiumModel.sol';

// xchain contracts
import 'src/interfaces/IChildGauge.sol';
import 'src/interfaces/IChildGaugeFactory.sol';
import 'src/interfaces/IRootGauge.sol';
import 'src/interfaces/IRootGaugeFactory.sol';
import 'src/interfaces/IAltInsure.sol';

contract DeploymentSetUp is Test {
    uint mainnetForkID = vm.createFork(vm.rpcUrl('mainnet'));
    uint arbitrumForkID = vm.createFork(vm.rpcUrl('arbitrum'));
    uint optimismForkID = vm.createFork(vm.rpcUrl('optimism'));
    uint polygonForkID = vm.createFork(vm.rpcUrl('polygon'));

    address admin = vm.addr(0x00001);
    // to avoid already used account(nonce is not zero), give complex hash as input
    address nonceAdjuster = vm.addr(uint(keccak256('XCHAIN_NONCE_ADJUSTER')));
    address alice = vm.addr(0xa11ce);
    address bob = vm.addr(0xb0b);

    IRootGaugeFactory arbRootGaugeFactory;
    IChildGaugeFactory arbChildGaugeFactory;
    address arbBridger;
    address[3] arbGauges;

    IRootGaugeFactory optRootGaugeFactory;
    IChildGaugeFactory optChildGaugeFactory;
    address optBridger;
    address[3] optGauges;

    IAltInsure altInsure;

    constructor() {
        _commitOwnerships();
        _setVeWhitelist();
        _altInsureDeploy(arbitrumForkID);
        _altInsureDeploy(optimismForkID);
        _arbGaugeDeploy();
    }

    function _commitOwnerships() public {
        vm.selectFork(mainnetForkID);
        // transfer ownership to testing admin
        IOwnership _pos = IOwnership(L1_POOL_OWNERSHIP);
        vm.prank(_pos.owner());
        _pos.commitTransferOwnership(admin);

        vm.prank(admin);
        _pos.acceptTransferOwnership();

        IOwnership _dos = IOwnership(L1_DAO_OWNERSHIP);

        vm.prank(_dos.owner());
        _dos.commitTransferOwnership(admin);

        vm.prank(admin);
        _dos.acceptTransferOwnership();
    }

    function _setVeWhitelist() public {
        vm.selectFork(mainnetForkID);
        vm.prank(admin);
        ISmartWalletChecker(SMART_WALLET_CHECKER).setWhitelist(alice, true);
    }

    function _altInsureDeploy(uint _forkID) internal {
        vm.selectFork(_forkID);
        address _altInsureImpl = _deployCode(ALT_INSURE_V1_BIN);

        vm.prank(admin);
        ERC1967Proxy _proxy = new ERC1967Proxy(
            _altInsureImpl,
            abi.encodeWithSignature(
                'initialize(address,address,address)',
                address(L1_INSURE),
                address(0),
                ARB_L2_GATEWAY
            )
        );

        altInsure = IAltInsure(address(_proxy));
    }

    function _arbGaugeDeploy() internal {
        vm.selectFork(mainnetForkID);
        arbBridger = _deployCode(CBRIDGE_BRIDGER_BIN, abi.encode(42161));

        // mainnet factory setup
        vm.startPrank(nonceAdjuster);
        arbRootGaugeFactory = IRootGaugeFactory(_deployCode(RGF_BIN, abi.encode(ANYCALL, address(admin))));

        address _rgImpl = _deployCode(RG_BIN, abi.encode(L1_INSURE, address(GAUGE_CONTROLLER), address(MINTER)));
        vm.stopPrank();

        vm.startPrank(admin);
        arbRootGaugeFactory.set_implementation(_rgImpl);
        arbRootGaugeFactory.set_bridger(42161, arbBridger);
        vm.stopPrank();

        // arbitrum factory setup
        vm.selectFork(arbitrumForkID);
        vm.startPrank(nonceAdjuster);
        arbChildGaugeFactory = IChildGaugeFactory(_deployCode(CGF_BIN, abi.encode(ANYCALL, address(altInsure), admin)));

        address _cgImpl = _deployCode(CG_BIN, abi.encode(address(altInsure), address(arbChildGaugeFactory)));
        vm.stopPrank();

        vm.startPrank(admin);
        arbChildGaugeFactory.set_implementation(_cgImpl);

        address[3] memory _markets = [MKT_GMX, MKT_RADIANT, MKT_DOPEX];

        vm.breakpoint('a');

        for (uint i = 0; i < _markets.length; i++) {
            address _market = address(_markets[i]);
            // use hashed market address as salt
            bytes32 _salt = keccak256(abi.encodePacked(_market));

            vm.selectFork(mainnetForkID);
            address _root = arbRootGaugeFactory.deploy_gauge(42161, _salt);

            IGaugeController(GAUGE_CONTROLLER).add_gauge(_root, 1, 10000);
            arbGauges[i] = _root;

            vm.selectFork(arbitrumForkID);
            address _child = arbChildGaugeFactory.deploy_gauge(_market, _salt);

            assertEq(_root, _child, 'RootGauge address != ChildGauge address');
            // storage variable is identical on both chains, so set variable again
            arbGauges[i] = _child;
        }

        vm.stopPrank();
    }

    function _optGaugeDeploy() internal {
        vm.selectFork(mainnetForkID);
        arbBridger = _deployCode(CBRIDGE_BRIDGER_BIN, abi.encode(10));

        // mainnet factory setup
        vm.startPrank(nonceAdjuster);
        optRootGaugeFactory = IRootGaugeFactory(_deployCode(RGF_BIN, abi.encode(ANYCALL, address(admin))));

        address _rgImpl = _deployCode(RG_BIN, abi.encode(L1_INSURE, address(GAUGE_CONTROLLER), address(MINTER)));
        vm.stopPrank();

        vm.startPrank(admin);
        optRootGaugeFactory.set_implementation(_rgImpl);
        optRootGaugeFactory.set_bridger(10, arbBridger);
        vm.stopPrank();

        vm.selectFork(optimismForkID);
        // optimism factory setup
        vm.startPrank(nonceAdjuster);
        optChildGaugeFactory = IChildGaugeFactory(_deployCode(CGF_BIN, abi.encode(ANYCALL, address(altInsure), admin)));

        address _cgImpl = _deployCode(CG_BIN, abi.encode(address(altInsure), address(optChildGaugeFactory)));
        vm.stopPrank();

        vm.startPrank(admin);
        optChildGaugeFactory.set_implementation(_cgImpl);

        address[3] memory _markets = [MKT_KWENTA, MKT_THALES, MKT_DFORCE];

        for (uint i = 0; i < _markets.length; i++) {
            address _market = address(_markets[i]);
            // use hashed market address as salt
            bytes32 _salt = keccak256(abi.encodePacked(_market));

            vm.selectFork(mainnetForkID);
            address _gauge = optRootGaugeFactory.deploy_gauge(10, _salt);
            optRootGaugeFactory.deploy_child_gauge(10, _market, _salt);

            optGauges[i] = _gauge;
            // storage variable is identical on both chains, so set variable again
            vm.selectFork(optimismForkID);
            optChildGaugeFactory.deploy_gauge(_market, _salt);
            // storage variable is identical on both chains, so set variable again
            optGauges[i] = _gauge;
        }

        vm.stopPrank();
    }

    function _deployCode(bytes memory code) internal returns (address addr) {
        assembly {
            addr := create(0, add(code, 0x20), mload(code))
        }
        require(addr.code.length != 0, 'deploy failed');
    }

    function _deployCode(bytes memory code, bytes memory data) internal returns (address addr) {
        bytes memory _code = abi.encodePacked(code, data);

        assembly {
            addr := create(0, add(_code, 0x20), mload(_code))
        }

        require(addr.code.length != 0, 'deploy failed');
    }

    function _toChainID(uint _forkID) internal view returns (uint) {
        if (_forkID == arbitrumForkID) {
            return 42161;
        } else if (_forkID == optimismForkID) {
            return 10;
        } else {
            revert('invalid fork id');
        }
    }

    function _computeAddress(bytes memory _code, bytes32 _salt) internal returns (address computed) {
        assembly {
            computed := create2(0, add(_code, 0x20), mload(_code), _salt)
        }
    }
}
