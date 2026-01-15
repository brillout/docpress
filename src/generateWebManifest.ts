export { generateWebManifest }

import type { PluginOption } from 'vite'
import type { Config } from './types/Config'
import { assert } from './utils/assert.js'
import fs from 'fs/promises'
import path from 'path'

function generateWebManifest(): PluginOption {
  let config: Config | undefined
  let outDir: string

  return {
    name: '@brillout/docpress:generateWebManifest',
    enforce: 'post',
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir
    },
    async buildStart() {
      try {
        const configModule = await import(path.join(process.cwd(), '+config'))
        config = configModule.default?.docpress || configModule.docpress
        assert(config, 'Config not found')
      } catch (err) {
        // Config might not be available in all contexts
        return
      }
    },
    async writeBundle() {
      if (!config) return

      const { faviconGoogle } = getFavicons(config)
      if (!faviconGoogle) return

      const manifest = {
        name: config.name,
        short_name: config.name,
        description: config.tagline,
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: faviconGoogle,
            sizes: '512x512',
            type: 'image/png',
            // https://web.dev/articles/maskable-icon
            purpose: 'maskable',
          },
        ],
      }

      const manifestPath = path.join(outDir, 'client', 'manifest.webmanifest')
      await fs.mkdir(path.dirname(manifestPath), { recursive: true })
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    },
  }
}

function getFavicons(config: Config) {
  let faviconBrowser: string
  let faviconGoogle: null | string = null
  if (!config.favicon) {
    faviconBrowser = config.logo
  } else if (typeof config.favicon === 'string') {
    faviconBrowser = config.favicon
  } else {
    faviconBrowser = config.favicon.browser
    faviconGoogle = config.favicon.google
  }
  return { faviconBrowser, faviconGoogle }
}
