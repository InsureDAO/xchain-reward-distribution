import { ethers } from 'hardhat'
import { getSigners, setBalance } from './helpers'
import { ARB_DAO_TREASURY, ARB_TOKEN, ARB_TOKEN_OWNER } from '../../constants/addresses'

async function main() {
  const [admin] = await getSigners('fork')
  const arbDaoTreasury = await ethers.getImpersonatedSigner(ARB_DAO_TREASURY)
  const arb = await ethers.getContractAt('IERC20', ARB_TOKEN, arbDaoTreasury)
  await setBalance(arbDaoTreasury.address, ethers.parseEther('1000'))

  await arb.transfer(admin.address, ethers.parseEther('1000')).then((tx) => tx.wait())
  console.log(`Minted 1000 ARB to ${admin.address}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
