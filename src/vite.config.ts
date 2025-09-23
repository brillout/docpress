export { config as viteConfig }

import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import type { PluginOption, UserConfig } from 'vite'
import { parsePageSections } from './parsePageSections.js'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { transformerNotationDiff } from '@shikijs/transformers'
import { remarkDetype } from './remarkDetype.js'
import { rehypeMetaToProps } from './rehypeMetaToProps.js'

const root = process.cwd()
const prettyCode = [
  rehypePrettyCode,
  { theme: 'github-light', keepBackground: false, transformers: [transformerNotationDiff()] },
]
const rehypePlugins: any = [prettyCode, [rehypeMetaToProps]]
const remarkPlugins = [remarkGfm, remarkDetype]

const config: UserConfig = {
  root,
  plugins: [
    parsePageSections(),
    mdx({ rehypePlugins, remarkPlugins, providerImportSource: '@brillout/docpress' }) as PluginOption,
    // @vitejs/plugin-react-swc needs to be added *after* the mdx plugins
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
