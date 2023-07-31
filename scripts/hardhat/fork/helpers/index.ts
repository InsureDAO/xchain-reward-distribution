import { network, ethers } from 'hardhat'

export function setBalance(address: string, balance: bigint) {
  return network.provider.request({
    method: 'anvil_setBalance',
    params: [address, balance.toString()],
  })
}

/**
 * wrapper function to get signers for both forked and non-forked mode
 * related to: https://github.com/NomicFoundation/hardhat/issues/1226
 */
export function getSigners(mode: string) {
  const adminKey = process.env.ADMIN_KEY
  const adjusterKey = process.env.NONCE_ADJUSTER_KEY

  if (!adminKey || !adjusterKey) throw new Error('Please set ADMIN_KEY and NONCE_ADJUSTER_KEY')

  const adminAddr = ethers.computeAddress(`0x${adminKey}`)
  const adjusterAddr = ethers.computeAddress(`0x${adjusterKey}`)

  const admin = mode === 'fork' ? ethers.getImpersonatedSigner(adminAddr) : ethers.getSigner(adminKey)
  const adjuster = mode === 'fork' ? ethers.getImpersonatedSigner(adjusterAddr) : ethers.getSigner(adjusterKey)

  return Promise.all([admin, adjuster])
}
