import { ethers, network } from 'hardhat'
import { getSigners } from '../setup/fork/helpers'

const l2ChainsMainnet = [10, 42161]
const l2ChainsTestnet = [420, 421613]

async function main() {
  const mode = process.env.MODE
  if (!mode) throw new Error('MODE env var is required')

  const [admin] = await getSigners(mode)

  const { default: addresses } = (await import(`../constants/addresses/${network.name}.json`)) as {
    default: { [key: string]: `0x${string}` }
  }
  const MINTER = addresses.MINTER
  if (!MINTER) throw new Error('MINTER address is required')

  const { default: core } = (await import(`../setup/deployed/core/${network.name}.json`)) as {
    default: { [key: string]: `0x${string}` }
  }

  const ROOT_GAUGE_FACTORY = core.rootGaugeFactory
  if (!ROOT_GAUGE_FACTORY) throw new Error('ROOT_GAUGE_FACTORY address is required')

  const rgf = await ethers.getContractAt('RootGaugeFactory', ROOT_GAUGE_FACTORY, admin)

  const chains = targetChains(mode)

  for (const chain of chains) {
    const n = await rgf.get_gauge_count(chain)

    if (n.toString() === '0') {
      console.log(`No gauges found on chain ${chain}`)
      continue
    }

    console.log(`Transmitting emissions for ${n} gauges on chain ${chain}`)

    for (let i = 0; i < n; i++) {
      const gauge = await rgf.get_gauge(chain, i)
      const rg = await ethers.getContractAt('RootGauge', gauge, admin)
      const minter = await ethers.getContractAt('IMinter', MINTER)

      console.log(`Transmit emissions for gauge ${gauge}`)

      // update emissions for the gauge
      await rg.user_checkpoint(ethers.ZeroAddress).then((tx) => tx.wait())

      // calculate emissions
      const totalMint = await rg.integrate_fraction(gauge)
      const minted = await minter.minted(gauge, gauge)
      const toMint = totalMint - minted
      const noMint = toMint.toString() === '0'

      // skip if no emissions, avoid tx revert of no emissions
      if (noMint) {
        console.log(`No emissions to transmit for gauge ${gauge}`)
        continue
      }
      // transmit emissions to its child gauge
      await rgf.transmit_emissions(gauge).then((tx) => tx.wait())
    }
  }
}

function targetChains(mode: string): number[] {
  if (mode === 'testnet') {
    return l2ChainsTestnet
  }

  return l2ChainsMainnet
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
