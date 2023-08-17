import { writeFileSync } from 'fs'
import { ethers, network } from 'hardhat'
import { getSigners } from './fork/helpers'

async function main() {
  const MODE = process.env.MODE
  if (!MODE) throw new Error('Please specify the mode with the MODE environment variable')

  const [admin, adjuster] = await getSigners(MODE)

  const { default: addresses } = (await import(`../constants/addresses/${network.name}.json`)) as {
    default: { [key: string]: string }
  }

  const RootGaugeFactory = await ethers.getContractFactory('RootGaugeFactory', adjuster)
  const RootGauge = await ethers.getContractFactory('RootGauge', adjuster)

  const rootGaugeFactory = await RootGaugeFactory.deploy(addresses.ANYCALL_PROXY, admin).then((c) =>
    c.waitForDeployment()
  )
  const rootGaugeImpl = await RootGauge.deploy(addresses.INSURE, addresses.GAUGE_CONTROLLER, addresses.MINTER).then(
    (c) => c.waitForDeployment()
  )

  await rootGaugeFactory
    .connect(admin)
    .set_implementation(rootGaugeImpl.target)
    .then((tx) => tx.wait())

  const out = JSON.stringify(
    {
      rootGaugeFactory: rootGaugeFactory.target,
      rootGaugeImpl: rootGaugeImpl.target,
    },
    null,
    2
  )

  console.log(out)

  writeFileSync(`${__dirname}/deployed/core/${network.name}.json`, out)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
