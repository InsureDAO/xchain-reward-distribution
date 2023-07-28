import { ethers, network } from 'hardhat'
import { solidityPackedKeccak256 } from 'ethers'
import { writeFileSync } from 'fs'

async function main() {
  const target = process.env.TARGET
  if (!target) throw new Error('Please specify the target chain with the TARGET environment variable')

  const [admin] = await ethers.getSigners()
  const { default: core } = (await import(`./deployed/core/${network.name}.json`)) as {
    default: { [key: string]: string }
  }
  const { default: markets } = (await import(`./deployed/markets/${target}.json`)) as {
    default: { [key: string]: string }
  }
  const factory = await ethers.getContractAt('RootGaugeFactory', core.rootGaugeFactory, admin)

  const out: { [key: string]: string } = {}

  for (const [name, address] of Object.entries(markets)) {
    const chainID = chainNameToID(target)
    const salt = solidityPackedKeccak256(['address'], [address])

    const gauge = await factory.connect(admin).deploy_gauge.staticCall(chainID, salt)
    await factory.deploy_gauge(chainID, salt).then((tx) => tx.wait())

    out[name] = gauge
  }

  const outJSON = JSON.stringify(out, null, 2)

  console.log(outJSON)

  writeFileSync(`${__dirname}/deployed/gauges/root-gauges.${target}.json`, outJSON)
}

function chainNameToID(name: string): number {
  switch (name) {
    case 'arbitrumFork':
      return 42161
    case 'opFork':
      return 10
    default:
      throw new Error(`Unknown chain ${name}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
