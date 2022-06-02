const args = process.argv.filter(Boolean).slice(2)

import { build, preview } from 'vite'
import { configFile } from './configFile'
const isDev = args.includes('dev')
const isPreview = args.includes('preview')
const isBuild = args.includes('build')

cli()

async function cli() {
  if (isDev) {
    await import('./devServer')
  } else if (isBuild) {
    await build({
      configFile,
      // @ts-ignore
      vitePluginSsr: { disableBuildChaining: true },
      build: { ssr: true }
    })
  } else if (isPreview) {
    const server = await preview({ configFile, preview: { host: true } })
    server.printUrls()
  } else {
    throw new Error(
      `Vikepress: unknown command \`$ vikepress ${args.join(
        ' '
      )}\`. Known commands: \`$ vikepress dev\` and \`$ vikepress preview\`.`
    )
  }
}
