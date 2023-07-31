import { HardhatUserConfig, extendEnvironment } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-foundry'
import '@nomiclabs/hardhat-vyper'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    mainnetFork: {
      url: 'http://localhost:8545',
    },
    arbitrumFork: {
      url: 'http://localhost:8546',
    },
    opFork: {
      url: 'http://localhost:8547',
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
