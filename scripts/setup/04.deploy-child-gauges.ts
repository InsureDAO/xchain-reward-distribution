import { ethers, network } from 'hardhat'
import { solidityPackedKeccak256 } from 'ethers'
import { writeFileSync } from 'fs'
import { getSigners } from './fork/helpers'

async function main() {
  const MODE = process.env.MODE
  if (!MODE) throw new Error('Please specify the mode with the MODE environment variable')

  const [admin] = await getSigners(MODE)
  const { default: core } = (await import(`./deployed/core/${network.name}.json`)) as {
    default: { [key: string]: string }
  }
  const { default: markets } = (await import(`./deployed/markets/${network.name}.json`)) as {
    default: { [key: string]: string }
  }
  const factory = await ethers.getContractAt('ChildGaugeFactory', core.childGaugeFactory, admin)

  const out: { [key: string]: string } = {}

  for (const [name, address] of Object.entries(markets)) {
    const salt = solidityPackedKeccak256(['address'], [address])

    const gauge = await factory['deploy_gauge(address,bytes32)'].staticCall(address, salt)
    await factory['deploy_gauge(address,bytes32)'](address, salt).then((tx) => tx.wait())

    out[name] = gauge
  }

  const outJSON = JSON.stringify(out, null, 2)

  console.log(outJSON)

  writeFileSync(`${__dirname}/deployed/gauges/child-gauges.${network.name}.json`, outJSON)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
