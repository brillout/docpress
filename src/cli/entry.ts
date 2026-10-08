import pc from '@brillout/picocolors'
import { lint } from './lint.js'

const usage = [
  'Usage: docpress <command>',
  '',
  'Commands:',
  '  lint    Check the docs (broken links, broken anchors, and link conventions). Run it at the docs root.',
].join('\n')

const args = process.argv.slice(2)
if (args.length === 1 && args[0] === 'lint') {
  cmdLint()
} else if (args.length === 0 || ['help', '--help', '-h'].includes(args[0]!)) {
  console.log(usage)
} else {
  console.error(`Unknown command: docpress ${args.join(' ')}\n\n${usage}`)
  process.exit(1)
}

function cmdLint() {
  const { errors, stats } = lint(process.cwd())
  if (errors.length > 0) {
    console.error(pc.red(pc.bold(`\n✗ docpress lint: ${errors.length} issue(s)\n`)))
    errors.forEach((err) => console.error('  ' + err))
    console.error('')
    process.exit(1)
  }
  const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`
  console.log(
    pc.green(
      `✓ docpress lint: ${count(stats.pages, 'page')}, ${count(stats.components, 'MDX component')}, ${count(stats.readmes, 'README')} — ` +
        `internal links (anchors, pages, and absolute ${stats.docsUrl} URLs) all resolve.`,
    ),
  )
}
