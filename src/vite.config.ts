export { config as viteConfig }

import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import type { PluginOption, UserConfig } from 'vite'
import { parsePageSections } from './parsePageSections.js'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { transformerNotationDiff } from '@shikijs/transformers'

const root = process.cwd()
const prettyCode = [rehypePrettyCode, { theme: 'github-light', transformers: [transformerNotationDiff()] }]
const rehypePlugins: any = [prettyCode]
const remarkPlugins = [remarkGfm]

const config: UserConfig = {
  root,
  plugins: [
    parsePageSections(),
    mdx({ rehypePlugins, remarkPlugins }) as PluginOption,
    react(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client'],
    exclude: ['@brillout/docpress'],
  },
  ssr: {
    noExternal: ['@brillout/docpress', '@docsearch/react'],
  },
  // Suppress following warning:
  // ```
  // ▲ [WARNING] Transforming this CSS nesting syntax is not supported in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14") [unsupported-css-nesting]
  // ```
  build: { target: 'es2022' },
  clearScreen: false,
}
