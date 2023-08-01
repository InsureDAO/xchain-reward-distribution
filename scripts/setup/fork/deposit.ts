import { ethers, network } from 'hardhat'
import { ARB_GATEWAY, ARB_USDC } from '../../constants/addresses'
import { getSigners, setBalance } from './helpers'

async function main() {
  const [admin] = await getSigners('fork')
  const gateway = await ethers.getImpersonatedSigner(ARB_GATEWAY)

  const arbErc20Interface = new ethers.Interface(['function bridgeMint(address account, uint256 amount)'])
  const arbErc20Contract = new ethers.Contract(ARB_USDC, arbErc20Interface)
  const erc20Contract = await ethers.getContractAt('IERC20', ARB_USDC, admin)

  await setBalance(gateway.address, ethers.parseEther('1000'))

  const tx = await arbErc20Contract['bridgeMint(address,uint256)'].populateTransaction(admin.address, 1000e6)
  await gateway.sendTransaction(tx).then((tx) => tx.wait())

  const { default: markets } = (await import(`../deployed/markets/${network.name}.json`)) as {
    default: { [key: string]: string }
  }

  for (const [name, address] of Object.entries(markets)) {
    const market = await ethers.getContractAt('IMarketTemplate', address, admin)
    const vault = await market.vault()

    await erc20Contract.approve(vault, ethers.MaxUint256).then((tx) => tx.wait())
    await market.deposit(100e6).then((tx) => tx.wait())

    console.log(`Deposited 100 USDC to ${name}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
