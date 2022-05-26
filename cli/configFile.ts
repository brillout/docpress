export { configFile }

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const configFile = require.resolve('../../vite.config.ts')
