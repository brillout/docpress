export { config as default }

import type { Config, ImportString } from 'vike/types'
import type { Exports } from './config/resolvePageContext'
import { viteConfig } from './vite.config.js'
import type { Config as DocpressConfig } from './types/Config'

const config = {
  name: '@brillout/docpress',
  require: { vike: '>=0.4.222' },
  vite: viteConfig,
  prerender: { noExtraDir: true },
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  onRenderClient: 'import:@brillout/docpress/renderer/onRenderClient:onRenderClient',
  onBeforeRender: 'import:@brillout/docpress/renderer/onBeforeRender:onBeforeRender',
  Layout: 'import:@brillout/docpress/Layout:Layout',
  clientRouting: true,
  hydrationCanBeAborted: true,
  passToClient: ['pageContextResolved'],
  meta: {
    Layout: {
      env: { client: true, server: true },
    },
    TopNavigation: {
      env: { client: true, server: true },
    },
    docpress: {
      env: { server: true },
      global: true,
    },
  },
  prefetch: {
    staticAssets: 'hover',
    pageContext: Infinity,
  },
} satisfies Config

type ReactComponent = () => React.JSX.Element
declare global {
  namespace Vike {
    interface PageContext {
      Page: ReactComponent
      exports: Exports
    }
    interface Config {
      Layout?: ReactComponent | null | ImportString
      TopNavigation?: ReactComponent
      docpress?: DocpressConfig
    }
  }
}
