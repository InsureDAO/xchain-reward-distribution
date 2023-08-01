import { Account, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrumFork, mainnetFork } from '../operations/chains/forks'
import { childGaugeFactory } from '../constants/abi/child-gauge-factory'
import { getArbitrumClient, getMainnetClient } from '../operations/utils/client'
import { rootGaugeFactory } from '../constants/abi/root-gauge-factory'

// TODO: replace with hardhat

async function main() {
  const key = process.env.NONCE_ADJUSTER_KEY
  if (!key) throw new Error('NONCE_ADJUSTER_KEY env var is required')

  const acc = privateKeyToAccount(key as `0x${string}`)

  const mWallet = _mainnetForkDeployer(acc)
  const mCli = getMainnetClient({ fork: true })

  const arbWallet = _arbForkDeployer(acc)
  const arbCli = getArbitrumClient({ fork: true })

  let hash = await mWallet.deployContract({
    abi: rootGaugeFactory,
    args: ['0x00', acc.address],
    bytecode: ROOT_GAUGE_FACTORY_BIN,
  })

  const rgf = await mCli.waitForTransactionReceipt({ hash }).then((r) => r.contractAddress)
  if (!rgf) throw new Error('no contract address')

  hash = await arbWallet.deployContract({
    abi: childGaugeFactory,
    args: ['0x00', '0x01', acc.address],
    bytecode: CHILD_GAUGE_FACTORY_BIN,
  })

  const cgf = await arbCli.waitForTransactionReceipt({ hash }).then((r) => r.contractAddress)
  if (!cgf) throw new Error('no contract address')
}

function _arbForkDeployer(account: Account) {
  return createWalletClient({
    chain: arbitrumFork,
    transport: http(),
    account,
  })
}

function _mainnetForkDeployer(account: Account) {
  return createWalletClient({
    chain: mainnetFork,
    transport: http(),
    account,
  })
}
