import { lint } from './lint.js'

const [command, ...args] = process.argv.slice(2)

if (command === 'lint' && args.length === 0) {
  lint()
} else {
  const isHelp = command === undefined || command === 'help' || command === '--help' || command === '-h'
  if (!isHelp) console.error(`Unknown command: docpress ${process.argv.slice(2).join(' ')}\n`)
  console.log(
    [
      'Usage: docpress <command>',
      '',
      'Commands:',
      '  lint    Check the docs (broken links, broken anchors, and link conventions). Run it at the docs root.',
    ].join('\n'),
  )
  if (!isHelp) process.exit(1)
}
