import { ethers, network } from 'hardhat'
import { ALT_INSURE_ARB, ALT_INSURE_OP, ANYCALL_PROXY } from '../constants/addresses'
import { writeFileSync } from 'fs'

async function main() {
  const [admin, adjuster] = await ethers.getSigners()
  const altInsureAddress = getAltInsureAddress(network.name)

  const ChildGaugeFactory = await ethers.getContractFactory('ChildGaugeFactory', adjuster)
  const ChildGauge = await ethers.getContractFactory('ChildGauge', admin)

  const childGaugeFactory = await ChildGaugeFactory.deploy(ANYCALL_PROXY, altInsureAddress, admin).then((c) =>
    c.waitForDeployment()
  )
  const childGaugeImpl = await ChildGauge.deploy(altInsureAddress, childGaugeFactory.target).then((c) =>
    c.waitForDeployment()
  )

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

function getAltInsureAddress(chainName: string) {
  switch (chainName) {
    case 'arbitrumFork':
      return ALT_INSURE_ARB
    case 'opFork':
      return ALT_INSURE_OP
    default:
      throw new Error(`Unsupported chain name: ${chainName}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
