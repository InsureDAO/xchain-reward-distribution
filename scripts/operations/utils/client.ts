import { OptionValues } from 'commander'
import { createPublicClient, http, publicActions, walletActions } from 'viem'
import { arbitrum, arbitrumGoerli, goerli, mainnet, optimism, optimismGoerli } from 'viem/chains'
import { arbitrumFork, mainnetFork, optimismFork } from '../chains/forks'

export function getMainnetClient(opts: OptionValues) {
  if (opts.testnet) {
    return createPublicClient({
      chain: goerli,
      name: 'goerli',
      transport: http(),
    }).extend(walletActions)
  }

  if (opts.fork)
    return createPublicClient({
      chain: mainnetFork,
      name: 'mainnetFork',
      transport: http(),
    })

  return createPublicClient({
    chain: mainnet,
    name: 'mainnet',
    transport: http(),
  }).extend(walletActions)
}

export function getArbitrumClient(opts: OptionValues) {
  if (opts.testnet)
    return createPublicClient({
      chain: arbitrumGoerli,
      name: 'arbitrumGoerli',
      transport: http(),
    }).extend(walletActions)

  if (opts.fork)
    return createPublicClient({
      chain: arbitrumFork,
      name: 'arbitrumFork',
      transport: http(),
    }).extend(walletActions)

  return createPublicClient({
    chain: arbitrum,
    name: 'arbitrum',
    transport: http(),
  }).extend(walletActions)
}

export function getOptimismClient(opts: OptionValues) {
  if (opts.testnet)
    return createPublicClient({
      chain: optimismGoerli,
      name: 'opGoerli',
      transport: http(),
    }).extend(walletActions)

  if (opts.fork)
    return createPublicClient({
      chain: optimismFork,
      name: 'opFork',
      transport: http(),
    }).extend(walletActions)

  return createPublicClient({
    chain: optimism,
    name: 'optimism',
    transport: http(),
  }).extend(walletActions)
}

export function getL2Client(opts: OptionValues) {
  if (opts.chain === 'arbitrum') return getArbitrumClient(opts)
  if (opts.chain === 'optimism') return getOptimismClient(opts)
  throw new Error('invalid chain name')
}
