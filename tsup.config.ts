import { defineConfig } from 'tsup'

export const FRAMEWORK_BUILDER_ASSET_DIR = 'FRAMEWORK_BUILDER_ASSET_DIR/'

export default defineConfig({
  entry: [
    './src/renderer/_default.page.client.ts',
    './src/renderer/_default.page.server.tsx',
    './index.ts',
    './cli/index.ts',
    './src/components/features/FeatureList.tsx',
    './src/components/features/initFeatureList.ts',
    './vite-plugin-ssr.config.ts'
  ],
  format: 'esm',
  clean: true,
  sourcemap: true,
  esbuildOptions(options, _context) {
    options.publicPath = FRAMEWORK_BUILDER_ASSET_DIR
  }
})
