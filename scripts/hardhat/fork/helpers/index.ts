import { network, ethers } from 'hardhat'
import { HardhatNetworkUserConfig } from 'hardhat/types'

export function setBalance(address: string, balance: bigint) {
  return network.provider.request({
    method: 'anvil_setBalance',
    params: [address, balance.toString()],
  })
}

export function impersonate(address: string) {
  // const config = network.config as HardhatNetworkUserConfig
  return network.provider.request({
    method: 'anvil_impersonateAccount',
    params: [address],
  })
}
