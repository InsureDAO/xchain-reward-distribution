import { ethers } from 'hardhat'
import { GAUGE_CONTROLLER, INSURE, MINTER, VOTING_ESCROW } from '../../constants/addresses'
import { getSigners, setBalance } from './helpers'

const insureToMint = ethers.parseEther('10000')
const nextYear = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60

async function main() {
  const [admin] = await getSigners('fork')
  const target = process.env.TARGET

  if (!target) throw new Error('Please specify the target chain with the TARGET environment variable')

  const minter = await ethers.getImpersonatedSigner(MINTER)
  await setBalance(minter.address, ethers.parseEther('1000'))
  const insure = await ethers.getContractAt('IInsureToken', INSURE, minter)
  await insure.mint(admin.address, insureToMint).then((tx) => tx.wait())

  const ve = await ethers.getContractAt('IVotingEscrow', VOTING_ESCROW, admin)
  const gc = await ethers.getContractAt('IGaugeController', GAUGE_CONTROLLER, admin)

  const { default: gauges } = (await import(`../deployed/gauges/root-gauges.${target}.json`)) as {
    default: { [key: string]: string }
  }

  await insure
    .connect(admin)
    .approve(VOTING_ESCROW, ethers.MaxUint256)
    .then((tx) => tx.wait())
  await ve.create_lock(insureToMint, nextYear).then((tx) => tx.wait())

  let rate = 5000

  for (const [name, address] of Object.entries(gauges)) {
    await gc.vote_for_gauge_weights(address, rate).then((tx) => tx.wait())
    console.log(`Voted  ${(rate / 10000) * 100} % for ${name}`)
    rate = Math.floor(rate / 2)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
