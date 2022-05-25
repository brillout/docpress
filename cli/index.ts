const args = process.argv.filter(Boolean).slice(2)

const isDev = args.includes('dev')
const isPreview = args.includes('preview')

cli()

async function cli() {
  if (isDev) {
    await import('./devServer')
  } else if (isPreview) {
  } else {
    throw new Error(
      `Vikepress: unknown command \`$ vikepress ${args.join(
        ' '
      )}\`. Known commands: \`$ vikepress dev\` and \`$ vikepress preview\`.`
    )
  }
}
