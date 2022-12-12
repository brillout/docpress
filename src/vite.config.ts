import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'
import { markdownHeadingsVitePlugin } from './markdownHeadingsVitePlugin'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const root = process.cwd()
const prettyCode = [rehypePrettyCode, { theme: 'github-light' }]
const rehypePlugins: any = [prettyCode]
const remarkPlugins = [remarkGfm]

const config: UserConfig = {
  root,
  plugins: [
    react(),
    markdownHeadingsVitePlugin(),
    mdx({ rehypePlugins, remarkPlugins }),
    ssr({
      prerender: {
        noExtraDir: true
      },
      // @ts-ignore until new version is released TODO
      extensions: [{
        npmPackageName: '@brillout/docpress',
        pageFilesDist: [
          '@brillout/docpress/renderer/_default.page.server.js',
          '@brillout/docpress/renderer/_default.page.client.js'
        ],
        assetsDir: '/dist/'
      }],
      includeAssetsImportedByServer: true,
      disableAutoFullBuild: true
    })
  ],
  // TODO: remove `react`?
  optimizeDeps: { include: ['@mdx-js/react', 'react', 'react-dom'] },
  // @ts-ignore
  ssr: {
    noExternal: ['@brillout/docpress']
  },
  clearScreen: false
}

export default config
