export { getConfig }
import { assertUsage } from '../utils'
import { Config } from './Config'

function getConfig(): Config {
  // We use `@ts-ignore` because the VikePress user will most likely not have `vite-plugin-glob/client` in his `tsconfig.json`.
  // @ts-ignore
  const globResult = import.meta.importGlob('/**/vikepress.config.*([a-zA-Z0-9])', { eager: true, import: 'default' })
  const files = Object.keys(globResult)
  assertUsage(files.length >= 1, 'No Vikepress config file found `vikepress.config.(js|ts|tsx|...)`')
  assertUsage(
    files.length === 1,
    `Found multiple \`vikepress.config.js\` files: ${files.map((f) => `\`${f}\``).join(', ')}. Define only one instead.`
  )
  const config = Object.values(globResult)[0] as Config
  return config
}
