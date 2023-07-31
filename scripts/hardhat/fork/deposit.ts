import { ethers } from 'hardhat'
import { ARB_USDC } from '../../constants/addresses'

async function main() {
  const [admin] = await ethers.getSigners()
  const signer = await ethers.getImpersonatedSigner(ethers.ZeroAddress)
  const usdc = await ethers.getContractAt('IERC20', ARB_USDC, signer)

  await usdc.transferFrom(signer.address, admin.address, 10000e6)

  console.log('balance:', usdc.balanceOf(admin.address).toString())
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
