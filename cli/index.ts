import { build, preview } from 'vite'
import { configFile } from './configFile'
import { prerender } from 'vite-plugin-ssr/prerender'
const args = process.argv.filter(Boolean).slice(2)
const isDev = args.includes('dev')
const isPreview = args.includes('preview')
const isBuild = args.includes('build')
Error.stackTraceLimit = Infinity

cli()

async function cli() {
  if (isDev) {
    await import('./devServer')
  } else if (isBuild) {
    const commonConfig = {
      configFile,
      vitePluginSsr: {
        disableAutoFullBuild: true
      }
    }
    await build({ ...commonConfig })
    await build({ ...commonConfig, build: { ssr: true } })
    await prerender({ viteConfig: { configFile } })
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
