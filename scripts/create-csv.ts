import { program } from 'commander'
import { gaugeController } from './constants/abi/gauge-controller'
import { childGaugeFactory } from './constants/abi/child-gauge-factory'
import { mkdirSync, writeFileSync } from 'fs'
import { getL2Client, getMainnetClient } from './utils/client'
import { GAUGE_CONTROLLER } from './constants/addresses'

program
  .option('-c, --chain <chain>', 'chain name')
  .option('-f, --fork', 'use fork')
  .option('-t, --testnet', 'use testnet')
  .option('-cgf, --child-gauge-factory <address>', 'child gauge factory address')
program.parse()

const opts = program.opts()

async function main() {
  const { chain, fork, testnet, childGaugeFactory: cgf } = opts

  if (!chain) throw new Error('chain name is required - use --chain <chain>')
  if (!cgf) throw new Error('child gauge factory address is required - use --child-gauge-factory <address>')
  if (fork && testnet) throw new Error('cannot use --fork and --testnet together')

  const mainnetClient = getMainnetClient(opts)
  const l2Client = getL2Client(opts)

  const gaugeCount = await l2Client.readContract({
    address: cgf,
    abi: childGaugeFactory,
    functionName: 'get_gauge_count',
  })

  let totalWeight = BigInt(0)

  const csv = [['gauge', 'weight', 'totalWeight']]

  for (let i = 0; i < gaugeCount; i++) {
    const gauge = await l2Client.readContract({
      address: cgf,
      abi: childGaugeFactory,
      functionName: 'get_gauge',
      args: [BigInt(i)],
    })

    console.log(`gauge ${i}: ${gauge}`)

    const weight = await mainnetClient.readContract({
      address: GAUGE_CONTROLLER,
      abi: gaugeController,
      functionName: 'get_gauge_weight',
      args: [gauge],
    })

    console.log(`weight ${i}: ${weight}`)

    totalWeight += weight

    csv.push([gauge, weight.toString()])
  }

  for (let i = 1; i < csv.length; i++) {
    csv[i].push(totalWeight.toString())
  }

  let csvString = ''
  for (const row of csv) {
    csvString += row.join(',') + '\n'
  }

  mkdirSync('./data', { recursive: true })

  const filename = `./data/${opts.chain}-gauge-weights-${cgf}.csv`

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
