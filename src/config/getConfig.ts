export { getConfig }
import { assert, assertUsage } from '../utils'
import { Config } from './Config'

function getConfig(): Config {
  const globResult = import.meta.globEager('/**/vikepress.config.*([a-zA-Z0-9])')
  const files = Object.keys(globResult)
  assertUsage(files.length >= 1, 'No Vikepress config file found `vikepress.config.(js|ts|tsx|...)`')
  assertUsage(
    files.length === 1,
    `Found multiple \`vikepress.config.js\` files: ${files.map((f) => `\`${f}\``).join(', ')}. Define only one instead.`
  )
  const configFile = Object.values(globResult)[0]
  assert(configFile.default)
  const config = configFile.default as Config
  return config
}
