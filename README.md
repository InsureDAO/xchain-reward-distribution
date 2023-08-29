# (WIP) XChain Reward Distribution Test / Script

This repository contains Xchain INSURE emission & reward distribution test & script.

# Prerequisites

- Following environment variables must be set
  - `ADMIN_KEY`: Admin account of xchain contracts
  - `NONCE_ADJUSTER_KEY`: Only used for the nonce adjustment of gauge factories and implementations between each chains
- set l1 contract addresses in `scripts/constants/addresses/{network_name}.json`

  - e.g. goerli

  ```
  {
    "ANYCALL_PROXY": "0x0000000000000000000000000000000000000000",
    "INSURE": "0x09f0Ad07E7363557D077CF3e3BbaB9365DA533F6",
    "GAUGE_CONTROLLER": "0xbF77F0e2C4A860d5f98d06BbbBA85242D50D3311",
    "MINTER": "0x71Be077d20a6dc38C235BbCCEa900C36eE841F0E",
    "VOTING_ESCROW": "0x11e54A8BbE393D23Bf91af7afb61f3f9BC94d59A",
    "L1_DAO_OWNERSHIP_OWNER": "0x168F8aA6d0aaeFCF75DdD3fF6793861114C035E8"
  }

  ```

  - `ANYCALL_PROXY` should be zero in most cases, despite you have deep understanding of the anycall
    - currently anycall used in the xchain gauge implementation is not maintained by the team
    - to use the proxy, you need to contact the team, allowed to use the xchain call
    - if set to zero, the xchain emission works fine

- set l2 contract addresses in `scripts/constants/addresses/{network_name}.json`
  - e.g. opGoerli
  ```
  {
    "ALT_INSURE": "0xfb0a8CF5B2302f880aA26461C78A8DC20A02aE25",
    "ANYCALL_PROXY": "0x0000000000000000000000000000000000000000",
    "REWARD_TOKEN": "0x0f50Ded1D958a6812eBFA4D0EB0d034bB1d1AbFd"
  }
  ```
  - set the `REWARD_TOKEN` to the token address you want to distribute

# Notes

- For other environment variables, check `hardhat.config.ts`
- All of the npm scripts found in `package.json`
- all of the deployed contracts in scripts will be located in the `scripts/setup/deployed` directory

# Core Contracts Setup

## Interaction Overview

[See Here](documents/deploy_flow.md)

## Steps

### 1. Deploy `RootGaugeFactory` & `RootGauge(implementation)` to L1

- `npm run deploy:core-goerli`
- if you can't find the script for preferred chain, you can run the script as following
  - `MODE=testnet npx hardhat run scripts/setup/01.deploy-mainnet-core.ts --network goerli`
    - `MODE` should be set to `fork`, `testnet`, or `mainnet`
    - set `--network` option to your preferred network

### 2. Deploy `Bridger` contract to L1

- `npm run deploy:bridger-goerli`
- or `MODE=testnet TARGET_CHAIN_ID=420 npx hardhat run scripts/setup/02.deploy-bridger.ts --network goerli`
- setting is almost same as step 1, but `TARGET_CHAIN_ID` is newly required
  - set this var to your bridge target(l2) chain id

### 3. Deploy `ChildGaugeFactory` & `ChildGauge(implementation)` to L2

- `npm run deploy:core-opGoerli`
- or `MODE=testnet npx hardhat run scripts/setup/03.deploy-l2-core.ts --network opGoerli`

### 4. Deploy root gauges to L1 with factory

- `npm run deploy:root-opGoerli`
- or `MODE=testnet TARGET=opGoerli npx hardhat run scripts/setup/04.deploy-root-gauges.ts --network goerli`
  - set `TARGET` to the network name listed on `hardhat.config.ts`

### 5. Deploy child gauges to L2 with factory

- `npm run deploy:child-opGoerli`
- or `MODE=testnet npx hardhat run scripts/setup/05.deploy-child-gauges.ts --network opGoerli`

### 6. Register gauges to `GaugeController`

- `npm run add-gauges:opGoerli`
- or `MODE=testnet TARGET=opGoerli hardhat run scripts/setup/06.add-gauges.ts --network goerli`

### 7. Register reward token to child gauges

- `npm run add-reward:opGoerli`
- or `MODE=testnet hardhat run scripts/setup/07.add-reward.ts --network opGoerli`

# Reward Distribution

## Interaction Overview

[See Here](documents/distribution_flow.md)

## Steps

### 1. Create CSV

- `npm run csv:opGoerli`
- or `npx ts-node scripts/operations/create-csv.ts -c optimism -t`
  - `-c`: l2 chain name
    - supported chains: `optimism, arbitrum`
  - `-t`: use testnet
- for the multi chain calls in the single script, we don't use hardhat
- csv file is generated in the `data` directory

### 2. Deposit reward tokens to child gauges

- `npm run deposit-reward:opGoerli`
- or `DEPOSITOR_KEY=$ADMIN_KEY npx ts-node scripts/operations/deposit-reward.ts -c optimism -t -a $AMOUNT -i $CSV_PATH`
  - `DEPOSITOR_KEY`: admin account of the child gauges
  - `AMOUNT`: the amount of tokens without decimals
    - e.g. You should set 1000 to AMOUNT to deposit 1000 OP token to gauges
  - `CSV_PATH`: path to the csv file created on step 1
    - e.g. `./data/20230825081153-opGoerli-gauge-weights.csv`
