import { writeFileSync } from 'fs'
import { ethers, network } from 'hardhat'
import { getSigners } from './fork/helpers'

async function main() {
  const MODE = process.env.MODE
  if (!MODE) throw new Error('Please specify the mode with the MODE environment variable')

  const [admin] = await getSigners(MODE)

  const targetChainId = process.env.TARGET_CHAIN_ID
  if (!targetChainId)
    throw new Error('Please specify the target chain ID with the TARGET_CHAIN_ID environment variable')

  const { default: core } = (await import(`./deployed/core/${network.name}.json`)) as {
    default: { [key: string]: string | undefined }
  }

  const rootGaugeFactoryAddress = core.rootGaugeFactory
  if (!rootGaugeFactoryAddress) throw new Error('No root gauge factory address found in core deployment file')

  //   const CBridgeBridger = await ethers.getContractFactory('CBridgeBridger', admin)
  // TODO: replace with cbridge on mainnet
  const OptimismBridger = await ethers.getContractFactory('OptimismBridgerGoerli', admin)

  const rootGaugeFactory = await ethers.getContractAt('RootGaugeFactory', rootGaugeFactoryAddress, admin)

  //   const bridger = await CBridgeBridger.deploy(targetChainId).then((c) => c.waitForDeployment())
  const bridger = await OptimismBridger.deploy().then((c) => c.waitForDeployment())

  await rootGaugeFactory
    .connect(admin)
    .set_bridger(targetChainId, bridger.target)
    .then((tx) => tx.wait())

  const out = JSON.stringify(
    {
      bridger: bridger.target,
    },
    null,
    2
  )

  console.log(out)

  writeFileSync(`${__dirname}/deployed/bridgers/${network.name}.json`, out)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
