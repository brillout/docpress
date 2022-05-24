import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import { markdownHeadings } from './vite.config/markdownHeadings'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const prettyCode = [rehypePrettyCode, { theme: 'github-light' }]
const rehypePlugins: any = [prettyCode]
const remarkPlugins = [remarkGfm]

const config: UserConfig = {
  root: process.cwd(),
  plugins: [react(), markdownHeadings(), mdx({ rehypePlugins, remarkPlugins }), ssr({
    prerender: {
      noExtraDir: true
    }
  })],
  optimizeDeps: { include: ['@mdx-js/react'] },
  clearScreen: false,
  resolve: {
    alias: {
      // Needed for MDX, see https://github.com/mdx-js/mdx/discussions/1794#discussioncomment-1581513
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
  },
}

export default config
