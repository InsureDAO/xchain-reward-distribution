import { ethers, run } from 'hardhat'
import { getSigners } from '../fork/helpers'

async function main() {
  const [admin] = await getSigners('testnet')

  const RewardToken = await ethers.getContractFactory('RewardToken', admin)

  const token = await RewardToken.deploy().then((c) => c.waitForDeployment())

  console.log('RewardToken deployed to:', token.target)

  await run('verify:verify', {
    address: token.target,
    constructorArguments: [],
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
