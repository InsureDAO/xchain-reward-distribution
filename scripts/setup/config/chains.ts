type ChainConfig = {
  chainID: number
}
export const chains: Record<string, ChainConfig> = {
  arbitrumFork: {
    chainID: 42161,
  },
  opFork: {
    chainID: 10,
  },
  opGoerli: {
    chainID: 420,
  },
}
