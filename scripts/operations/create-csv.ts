import { program } from 'commander'
import { gaugeController } from '../constants/abi/gauge-controller'
import { childGaugeFactory } from '../constants/abi/child-gauge-factory'
import { mkdirSync, writeFileSync } from 'fs'
import { getL2Client, getMainnetClient } from './utils/client'

program
  .option('-c, --chain <chain>', 'chain name')
  .option('-f, --fork', 'use fork')
  .option('-t, --testnet', 'use testnet')
program.parse()

const opts = program.opts()

async function main() {
  const { chain, fork, testnet } = opts

  if (!chain) throw new Error('chain name is required - use --chain <chain>')
  if (fork && testnet) throw new Error('cannot use --fork and --testnet together')

  const mainnetClient = getMainnetClient(opts)
  const l2Client = getL2Client(opts)

  const { default: l1Addresses } = (await import(`../constants/addresses/${mainnetClient.name}.json`)) as {
    default: { [key: string]: `0x${string}` }
  }
  const gaugeControllerAddress = l1Addresses.GAUGE_CONTROLLER
  if (!gaugeControllerAddress) throw new Error('GAUGE_CONTROLLER not found')

  const { default: core } = (await import(`../setup/deployed/core/${l2Client.name}.json`)) as {
    default: { [key: string]: `0x${string}` }
  }
  const cgf = core.childGaugeFactory
  if (!cgf) throw new Error('childGaugeFactory not found')

  const gaugeCount = await l2Client.readContract({
    address: cgf,
    abi: childGaugeFactory,
    functionName: 'get_gauge_count',
  })

  const csv = [['gauge', 'weight']]

  for (let i = 0; i < gaugeCount; i++) {
    const gauge = await l2Client.readContract({
      address: cgf,
      abi: childGaugeFactory,
      functionName: 'get_gauge',
      args: [BigInt(i)],
    })

    console.log(`gauge ${i}: ${gauge}`)

    let { result } = await mainnetClient.simulateContract({
      address: gaugeControllerAddress,
      abi: gaugeController,
      functionName: 'gauge_relative_weight_write',
      // args: [gauge, BigInt(0)],
      args: [gauge, BigInt(1692867600)],
    })

    // * NOTES: gauge_relative_weight_write returns 1 even if no vote is casted
    if (result.toString() === '1') result = BigInt(0)

    console.log(`weight ${i}: ${result}`)

    csv.push([gauge, result.toString()])
  }

  let csvString = ''
  for (const row of csv) {
    csvString += row.join(',') + '\n'
  }

  mkdirSync('./data', { recursive: true })

  const now = new Date()
  const dateTime = now.toISOString().replace(/[:T-]/g, '').split('.')[0]
  const filename = `./data/${dateTime}-${l2Client.name}-gauge-weights.csv`

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
