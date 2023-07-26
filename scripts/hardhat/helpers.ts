import { network } from 'hardhat'

export function setBalance(address: string, balance: bigint) {
  return network.provider.request({
    method: 'anvil_setBalance',
    params: [address, balance.toString()],
  })
}
