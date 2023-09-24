import { build, preview } from 'vite'
import config from '../vite.config'
import { prerender } from 'vike/prerender'
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
    await build(config)
    await build({ ...config, build: { ssr: true } })
    await prerender({ viteConfig: config as any })
  } else if (isPreview) {
    const server = await preview({ ...config, preview: { host: true } })
    server.printUrls()
  } else {
    throw new Error(
      `DocPress: unknown command \`$ docpress ${args.join(
        ' '
      )}\`. Known commands: \`$ docpress dev\` and \`$ docpress preview\`.`
    )
  }
}
