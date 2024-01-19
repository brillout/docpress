export { getConfig }
import { assert, assertUsage } from '../utils/server'
import { Config } from '../types/Config'

function getConfig(): Config {
  // We use `@ts-ignore` because the DocPress user most likely didn't add `vite/client` in his `tsconfig.json`.
  // @ts-ignore
  const globResult = import.meta.glob('/**/docpress.config.*([a-zA-Z0-9])', { eager: true })
  const files = Object.keys(globResult)
  assertUsage(files.length >= 1, 'No DocPress config file found `docpress.config.(js|ts|tsx|...)`')
  assertUsage(
    files.length === 1,
    `Found multiple \`docpress.config.js\` files: ${files.map((f) => `\`${f}\``).join(', ')}. Define only one instead.`
  )
  const config = (Object.values(globResult)[0] as any).default as Config
  assert(config)
  return config
}
