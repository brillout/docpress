import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import vike from 'vike/plugin'
import { UserConfig } from 'vite'
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
    mdx({ rehypePlugins, remarkPlugins }),
    // @vitejs/plugin-react-swc needs to be added *after* the mdx plugins
    react(),
    vike({
      prerender: {
        noExtraDir: true,
      },
      includeAssetsImportedByServer: true,
    }),
  ],
  optimizeDeps: { include: ['@mdx-js/react', 'react-dom'] },
  // @ts-ignore
  ssr: {
    noExternal: ['@brillout/docpress'],
  },
  clearScreen: false,
}

export default config
