import { ethers } from 'hardhat'
import { getSigners, setBalance } from './helpers'
import { parseEther } from 'viem'

async function main() {
  const [admin, adjuster] = await getSigners('fork')
  setBalance(admin.address, parseEther('1000'))
  setBalance(adjuster.address, parseEther('1000'))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
