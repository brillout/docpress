export { config }

import type { Config } from 'vike/types'
import docpress from '@brillout/docpress/config'

const config = {
  extends: docpress,
  choices: {
    server: {
      choices: ['Hono', 'Express', 'Fastify'],
      default: 'Hono',
    },
    uiFrameworkVikeExtension: {
      choices: ['vike-react', 'vike-vue', 'vike-solid'],
      default: 'vike-react',
    },
  },
} satisfies Config
