import { defineConfig } from 'tsup'

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
  sourcemap: true
})
