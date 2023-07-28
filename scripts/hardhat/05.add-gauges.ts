import { ethers } from 'hardhat'
import { GAUGE_CONTROLLER, L1_DAO_OWNERSHIP_OWNER } from '../constants/addresses'

const GAUGE_TYPE = 1

async function main() {
  const [admin] = await ethers.getSigners()
  const target = process.env.TARGET
  if (!target) throw new Error('Please specify the target chain with the TARGET environment variable')
  const mode = process.env.MODE ?? 'live'

  const gc = await ethers.getContractAt('IGaugeController', GAUGE_CONTROLLER, admin)

  const { default: gauges } = (await import(`./deployed/gauges/root-gauges.${target}.json`)) as {
    default: { [key: string]: string }
  }

  const { default: weights } = (await import(`./config/gauge-weights/${target}.json`)) as {
    default: { [key: string]: number }
  }

  for (const [name, address] of Object.entries(gauges)) {
    console.log(`adding ${name} (${address}) to gauge controller`)
    const weight = weights[name]

    if (!weight) throw new Error(`no weight found for ${name}`)

    const signer = mode === 'fork' ? await ethers.getImpersonatedSigner(L1_DAO_OWNERSHIP_OWNER) : admin

    await gc
      .connect(signer)
      .add_gauge(address, GAUGE_TYPE, weight)
      .then((tx) => tx.wait())
  }

  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
