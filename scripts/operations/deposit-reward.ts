import { program } from 'commander'
import * as csv from 'csvtojson'
import { privateKeyToAccount } from 'viem/accounts'
import { childGauge } from '../constants/abi/child-gauge'
import { getL2Client } from './utils/client'
import { formatEther, parseEther } from 'viem'

program
  .option('-c, --chain <chain>', 'chain name')
  .option('-f, --fork', 'use fork')
  .option('-t, --testnet', 'use testnet')
  .option('-i, --input <path>', 'input file path')
  .option('-a, --amount <amount>', 'amount to deposit in ether')

program.parse()

const opts = program.opts()

async function main() {
  const { chain, fork, testnet, input, amount } = opts

  if (!chain) throw new Error('chain name is required - use --chain <chain>')
  if (!input) throw new Error('input file path is required - use --input <path>')
  if (!amount) throw new Error('amount is required - use --amount <amount>')
  if (fork && testnet) throw new Error('cannot use --fork and --testnet together')

  const l2Client = getL2Client(opts)

  const depositorKey = process.env.DEPOSITOR_KEY
  if (!depositorKey) throw new Error('DEPOSITOR_KEY env var is required')

  const account = privateKeyToAccount(`0x${depositorKey}`)

  const { default: addresses } = (await import(`../constants/addresses/${l2Client.name}.json`)) as {
    default: { [key: string]: `0x${string}` }
  }

  const reward = addresses.REWARD_TOKEN
  if (!reward) throw new Error('REWARD_TOKEN not found')

  const rows = (await csv.default().fromFile(input)) as { gauge: string; weight: string }[]

  const totalWeight = rows.reduce((acc, row) => acc + BigInt(row.weight), BigInt(0))

  console.log({ totalWeight })

  for (const row of rows) {
    const rate = (BigInt(row.weight) * BigInt(parseEther(amount))) / BigInt(totalWeight)

    if (rate === BigInt(0)) continue

    const { request } = await l2Client.simulateContract({
      account,
      address: row.gauge as `0x${string}`,
      abi: childGauge,
      functionName: 'deposit_reward_token',
      args: [reward, rate],
    })

    const hash = await l2Client.writeContract(request)
    await l2Client.waitForTransactionReceipt({ hash })

    console.log(`deposited ${formatEther(rate)} (unit = ether) token to ${row.gauge}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
