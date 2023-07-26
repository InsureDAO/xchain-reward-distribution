import { ethers, network } from 'hardhat'
import { solidityPackedKeccak256 } from 'ethers'
import { writeFileSync } from 'fs'

async function main() {
  const [admin] = await ethers.getSigners()
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

    const gauge = await factory.connect(admin)['deploy_gauge(address,bytes32)'].staticCall(address, salt)
    await factory
      .connect(admin)
      ['deploy_gauge(address,bytes32)'](address, salt)
      .then((tx) => tx.wait())

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
