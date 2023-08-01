import { ethers } from 'hardhat'
import { getSigners } from './setup/fork/helpers'
import { ARB_TOKEN } from './constants/addresses'

async function main() {
  const [admin] = await getSigners('fork')
  const arb = await ethers.getContractAt('IERC20', ARB_TOKEN, admin)
  const balance = await arb.balanceOf(admin.address)

  console.log({ balance })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
