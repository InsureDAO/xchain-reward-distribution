import { Chain, foundry } from 'viem/chains'

export const mainnetFork: Chain = {
  ...foundry,
  name: 'mainnet-fork',
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
    public: {
      http: ['http://localhost:8545'],
    },
  },
}

export const arbitrumFork: Chain = {
  ...foundry,
  name: 'arbitrum-fork',
  rpcUrls: {
    default: {
      http: ['http://localhost:8546'],
    },
    public: {
      http: ['http://localhost:8546'],
    },
  },
}

export const optimismFork: Chain = {
  ...foundry,
  name: 'optimism-fork',
  rpcUrls: {
    default: {
      http: ['http://localhost:8547'],
    },
    public: {
      http: ['http://localhost:8547'],
    },
  },
}
