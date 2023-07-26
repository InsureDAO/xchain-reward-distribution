import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-foundry'
import '@nomiclabs/hardhat-vyper'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    mainnetFork: {
      url: 'http://localhost:8545',
      accounts: [process.env.ADMIN_KEY!, process.env.NONCE_ADJUSTER_KEY!],
    },
    arbitrumFork: {
      url: 'http://localhost:8546',
      accounts: [process.env.ADMIN_KEY!, process.env.NONCE_ADJUSTER_KEY!],
    },
    opFork: {
      url: 'http://localhost:8547',
      accounts: [process.env.ADMIN_KEY!, process.env.NONCE_ADJUSTER_KEY!],
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
      },
    ],
  },
  vyper: {
    compilers: [
      {
        version: '0.3.1',
      },
      {
        version: '0.3.7',
      },
    ],
  },
}

export default config
