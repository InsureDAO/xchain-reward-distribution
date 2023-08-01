import { ethers, network } from 'hardhat'
import { getSigners } from './fork/helpers'

async function main() {
  const [admin] = await getSigners('fork')

  const reward = process.env.REWARD_TOKEN
  if (!reward) throw new Error('Please specify the reward token with the REWARD_TOKEN environment variable')

  const erc20 = await ethers.getContractAt('IERC20', reward, admin)

  const { default: gauges } = (await import(`./deployed/gauges/child-gauges.${network.name}.json`)) as {
    default: { [key: string]: string }
  }

  for (const [name, address] of Object.entries(gauges)) {
    const gauge = await ethers.getContractAt('ChildGauge', address, admin)

    await gauge.add_reward(reward, admin).then((tx) => tx.wait())
    await erc20.approve(address, ethers.MaxUint256).then((tx) => tx.wait())

    console.log(`added reward ${reward} to ${name} (${address})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
