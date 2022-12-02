export { configFile }

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// Current file: /dist/chunk-XXXXXXXX.js (/src/cli/configFile.ts is bundled into /dist/chunk-XXXXX.js)
const configFile = require.resolve('./vite.config.js')
