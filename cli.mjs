#!/usr/bin/env node

const args = process.argv.filter(Boolean).slice(2)

const isDev = args.includes('dev')
const isPreview = args.includes('preview')

if (isDev) {
  await import('./cli/devServer.js')
} else if (isPreview) {
} else {
  throw new Error(
    `Vikepress: unknown command \`$ vikepress ${args.join(
      ' '
    )}\`. Known commands: \`$ vikepress dev\` and \`$ vikepress preview\`.`
  )
}
