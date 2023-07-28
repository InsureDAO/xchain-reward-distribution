import { ethers } from 'hardhat'
import { GAUGE_CONTROLLER } from '../../constants/addresses'

async function main() {
  const [admin] = await ethers.getSigners()
  const target = process.env.TARGET

  if (!target) throw new Error('Please specify the target chain with the TARGET environment variable')

  const { default: core } = (await import(`./deployed/core/${target}.json`)) as {
    default: { [key: string]: string }
  }

  const { default: gauges } = (await import(`./deployed/gauges/root-gauges.${target}.json`)) as {
    default: { [key: string]: string }
  }

  const factory = await ethers.getContractAt('RootGaugeFactory', core.rootGaugeFactory, admin)
  const gaugeController = await ethers.getContractAt('GaugeController', GAUGE_CONTROLLER, admin)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
