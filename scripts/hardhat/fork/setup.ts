import { ethers } from 'hardhat'
import { setBalance } from './helpers'
import { parseEther } from 'viem'

async function main() {
  const [admin, adjuster] = await ethers.getSigners()
  setBalance(admin.address, parseEther('1000'))
  setBalance(adjuster.address, parseEther('1000'))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
