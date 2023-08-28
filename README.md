# (WIP) XChain Reward Distribution Test / Script

This repository contains Xchain INSURE emission & reward distribution test & script.

# Core Contracts Deploy

## Interaction Overview

[See Here](documents/deploy_flow.md)

## Process

### Prerequisites

- Following environment variables must be set
  - `ADMIN_KEY`: Admin account of xchain contracts
  - `NONCE_ADJUSTER_KEY`: Only used for the nonce adjustment of gauge factories and implementations between each chains
- For other environment variables, check `hardhat.config.ts`

### 1. Deploy `RootGaugeFactory` & `RootGauge(implementation)` to L1

- `npm run deploy:core-goerli`
- or `MODE=testnet npx hardhat run scripts/setup/01.deploy-mainnet-core.ts --network goerli`
  - `MODE` should be set to `fork`, `testnet`, or `mainnet`
  - set `--network` option to your preferred network

### 2. Deploy `Bridger` contract to L1

- `npm run deploy:bridger-goerli`
- or `MODE=testnet TARGET_CHAIN_ID=420 npx hardhat run scripts/setup/02.deploy-bridger.ts --network goerli`
- setting is almost same as step 1, but `TARGET_CHAIN_ID` is newly required
  - set this var to your bridge target(l2) chain id

### 3. Deploy `ChildGaugeFactory` & `ChildGauge(implementation)` to L2

### 4. Deploy root gauges to L1 with factory

### 5. Deploy child gauges to L2 with factory

### 6. Register gauges to `GaugeController`

### 7. Register reward token to child gauges

# Reward Distribution

## Interaction Overview

[See Here](documents/distribution_flow.md)

## Process

### Prerequisites

### 1. Create CSV

### 2. Deposit reward tokens to child gauges
