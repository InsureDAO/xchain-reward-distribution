import { ethers, network } from 'hardhat'
import { writeFileSync } from 'fs'
import { getSigners } from './fork/helpers'

async function main() {
  const MODE = process.env.MODE
  if (!MODE) throw new Error('Please specify the mode with the MODE environment variable')

  const [admin, adjuster] = await getSigners(MODE)

  const { default: addresses } = (await import(`../constants/addresses/${network.name}.json`)) as {
    default: { [key: string]: string }
  }

  const ChildGaugeFactory = await ethers.getContractFactory('ChildGaugeFactory', adjuster)
  const ChildGauge = await ethers.getContractFactory('ChildGauge', adjuster)

  const childGaugeFactory = await ChildGaugeFactory.deploy(addresses.ANYCALL_PROXY, addresses.ALT_INSURE, admin).then(
    (c) => c.waitForDeployment()
  )
  const childGaugeImpl = await ChildGauge.deploy(addresses.ALT_INSURE, childGaugeFactory.target).then((c) =>
    c.waitForDeployment()
  )

  await childGaugeFactory
    .connect(admin)
    .set_implementation(childGaugeImpl.target)
    .then((tx) => tx.wait())

  const out = JSON.stringify(
    {
      childGaugeFactory: childGaugeFactory.target,
      childGaugeImpl: childGaugeImpl.target,
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
