import { writeFileSync } from 'fs'
import { ethers, network } from 'hardhat'
import { ANYCALL_PROXY, GAUGE_CONTROLLER, INSURE, MINTER } from '../constants/addresses'

const CHAIN_ID_ARBITRUM = 42161
const CHAIN_ID_OP = 10

async function main() {
  const [admin, adjuster] = await ethers.getSigners()

  const RootGaugeFactory = await ethers.getContractFactory('RootGaugeFactory', adjuster)
  const RootGauge = await ethers.getContractFactory('RootGauge', admin)
  const Bridger = await ethers.getContractFactory('CBridgeBridger', admin)

  const rootGaugeFactory = await RootGaugeFactory.deploy(ANYCALL_PROXY, admin).then((c) => c.waitForDeployment())
  const rootGaugeImpl = await RootGauge.deploy(INSURE, GAUGE_CONTROLLER, MINTER).then((c) => c.waitForDeployment())

  const arbBridger = await Bridger.deploy(CHAIN_ID_ARBITRUM).then((c) => c.waitForDeployment())
  const opBridger = await Bridger.deploy(CHAIN_ID_OP).then((c) => c.waitForDeployment())

  await rootGaugeFactory
    .connect(admin)
    .set_bridger(CHAIN_ID_ARBITRUM, arbBridger.target)
    .then((tx) => tx.wait())
  await rootGaugeFactory
    .connect(admin)
    .set_bridger(CHAIN_ID_OP, opBridger.target)
    .then((tx) => tx.wait())

  const out = JSON.stringify(
    {
      rootGaugeFactory: rootGaugeFactory.target,
      rootGaugeImpl: rootGaugeImpl.target,
      arbBridger: arbBridger.target,
      opBridger: opBridger.target,
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
