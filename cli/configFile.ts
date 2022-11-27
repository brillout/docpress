export { configFile }

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// Current file: '/dist/cli/chunk-XXXXX.js' (`/cli/configFile.ts` gets bundled into `/dist/chunk-XXXXX.js`)
const configFile = require.resolve('../vite.config.ts')
