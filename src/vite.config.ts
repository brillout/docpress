import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import ssr from 'vike/plugin'
import { UserConfig } from 'vite'
import { markdownHeadingsVitePlugin } from './markdownHeadingsVitePlugin'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const root = process.cwd()
const prettyCode = [rehypePrettyCode, { theme: 'github-light' }]
const rehypePlugins: any = [prettyCode]
const remarkPlugins = [remarkGfm]

const isDev = !process.argv[1]!.endsWith('/bin.js')
const extensionFiles = isDev
  ? { pageFilesSrc: '/src/renderer/*' }
  : {
      pageFilesDist: [
        '@brillout/docpress/renderer/_default.page.server.js',
        '@brillout/docpress/renderer/_default.page.client.js'
      ],
      assetsDir: '/dist/'
    }

const config: UserConfig = {
  root,
  plugins: [
    markdownHeadingsVitePlugin(),
    mdx({ rehypePlugins, remarkPlugins }),
    // @vitejs/plugin-react-swc needs to be added *after* the mdx plugins
    react(),
    ssr({
      prerender: {
        noExtraDir: true
      },
      extensions: [
        {
          npmPackageName: '@brillout/docpress',
          ...extensionFiles
        }
      ],
      includeAssetsImportedByServer: true,
      disableAutoFullBuild: true
    })
  ],
  optimizeDeps: { include: ['@mdx-js/react', 'react-dom'] },
  // @ts-ignore
  ssr: {
    noExternal: ['@brillout/docpress']
  },
  clearScreen: false
}

export default config
