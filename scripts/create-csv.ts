import { program } from 'commander'
import { gaugeController } from './constants/abi/gauge-controller'
import { childGaugeFactory } from './constants/abi/child-gauge-factory'
import { mkdir, mkdirSync, writeFileSync } from 'fs'
import { getL2Client, getMainnetClient } from './utils/client'

program
  .option('-c, --chain <chain>', 'chain name')
  .option('-f, --fork', 'use fork')
  .option('-t, --testnet', 'use testnet')
program.parse()

const opts = program.opts()

// TODO: add support for other chains
const GAUGE_CONTROLLER = '0x297ea2afcE594149Cd31a9b11AdBAe82fa1Ddd04' // mainnet
// TODO: add support for multiple chains
const CHILD_GAUGE_FACTORY = '0x00'

async function main() {
  if (!opts.chain) throw new Error('chain name is required - use --chain <chain>')

  if (opts.fork && opts.testnet) throw new Error('cannot use --fork and --testnet together')

  const mainnetClient = getMainnetClient(opts)
  const l2Client = getL2Client(opts)

  const gaugeCount = await l2Client.readContract({
    address: '0x00',
    abi: childGaugeFactory,
    functionName: 'get_gauge_count',
  })

  let totalWeight = BigInt(0)

  const csv = [['gauge', 'weight', 'totalWeight']]

  for (let i = 0; i < gaugeCount; i++) {
    const gauge = await l2Client.readContract({
      address: '0x00',
      abi: childGaugeFactory,
      functionName: 'get_gauge',
      args: [BigInt(i)],
    })

    const weight = await mainnetClient.readContract({
      address: GAUGE_CONTROLLER,
      abi: gaugeController,
      functionName: 'get_gauge_weight',
      args: [gauge],
    })

    totalWeight += weight

    csv.push([gauge, weight.toString()])
  }

  for (const row of csv) {
    row.push(totalWeight.toString())
  }

  let csvString = ''
  for (const row of csv) {
    csvString += row.join(',') + '\n'
  }

  mkdirSync('./data', { recursive: true })

  const filename = `./data/${opts.chain}-gauge-weights.csv`

  console.log(`writing ${filename}`)

  writeFileSync(filename, csvString, {
    encoding: 'utf-8',
  })

  console.log('done')

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
