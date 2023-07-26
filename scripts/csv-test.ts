import { mkdir, mkdirSync, writeFileSync } from 'fs'

function main() {
  const csv = [['a', 'b', 'c']]
  for (let i = 0; i < 10; i++) {
    csv.push([i.toString(), (i * 2).toString(), (i * 3).toString()])
  }

  let csvString = ''
  for (const row of csv) {
    csvString += row.join(',') + '\n'
  }

  mkdirSync('./data', { recursive: true })

  writeFileSync('./data/test.csv', csvString, {
    encoding: 'utf-8',
  })

  process.exit(0)
}

main()
