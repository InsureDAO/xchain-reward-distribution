import { OptionValues } from 'commander'
import { createPublicClient, http, publicActions, walletActions } from 'viem'
import { arbitrum, arbitrumGoerli, mainnet, optimism, optimismGoerli, sepolia } from 'viem/chains'
import { arbitrumFork, mainnetFork, optimismFork } from '../chains/forks'

export function getMainnetClient(opts: OptionValues) {
  if (opts.testnet) {
    return createPublicClient({
      chain: sepolia,
      transport: http(),
    }).extend(walletActions)
  }

  if (opts.fork)
    return createPublicClient({
      chain: mainnetFork,
      transport: http(),
    })

  return createPublicClient({
    chain: mainnet,
    transport: http(),
  }).extend(walletActions)
}

export function getArbitrumClient(opts: OptionValues) {
  if (opts.testnet)
    return createPublicClient({
      chain: arbitrumGoerli,
      transport: http(),
    }).extend(walletActions)

  if (opts.fork)
    return createPublicClient({
      chain: arbitrumFork,
      transport: http(),
    }).extend(walletActions)

  return createPublicClient({
    chain: arbitrum,
    transport: http(),
  }).extend(walletActions)
}

export function getOptimismClient(opts: OptionValues) {
  if (opts.testnet)
    return createPublicClient({
      chain: optimismGoerli,
      transport: http(),
    }).extend(walletActions)

  if (opts.fork)
    return createPublicClient({
      chain: optimismFork,
      transport: http(),
    }).extend(walletActions)

  return createPublicClient({
    chain: optimism,
    transport: http(),
  }).extend(walletActions)
}

export function getL2Client(opts: OptionValues) {
  if (opts.chain === 'arbitrum') return getArbitrumClient(opts)
  if (opts.chain === 'optimism') return getOptimismClient(opts)
  throw new Error('invalid chain name')
}
