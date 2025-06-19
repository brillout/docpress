export { config as default }

import type { Config, ImportString } from 'vike/types'
import { viteConfig } from './vite.config.js'
import type { Config as DocpressConfig } from './types/Config'
import type { PageSection } from './parsePageSections'
import type { PageContextResolved } from './resolveConf.js'

const config = {
  name: '@brillout/docpress',
  require: { vike: '>=0.4.222' },
  vite: viteConfig as Record<string, unknown>,
  prerender: { noExtraDir: true },
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  onRenderClient: 'import:@brillout/docpress/renderer/onRenderClient:onRenderClient',
  onCreateGlobalContext: 'import:@brillout/docpress/renderer/onCreateGlobalContext:onCreateGlobalContext',
  onCreatePageContext: 'import:@brillout/docpress/renderer/onCreatePageContext:onCreatePageContext',
  Layout: 'import:@brillout/docpress/Layout:Layout',
  clientRouting: true,
  hydrationCanBeAborted: true,
  passToClient: [
    // TODO: pass subset?
    'configDocpress',
  ],
  meta: {
    // TODO: remove?
    Layout: {
      env: { client: true, server: true },
    },
    // TODO: remove?
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
      pageContextResolved: PageContextResolved
    }
    interface Config {
      Layout?: ReactComponent | null | ImportString
      TopNavigation?: ReactComponent
      docpress?: DocpressConfig
    }
    interface ConfigResolved {
      docpress: DocpressConfig
      pageSectionsExport: PageSection[] | undefined
    }
    interface GlobalContext {
      // Passed to client
      configDocpress: DocpressConfig
    }
  }
}
