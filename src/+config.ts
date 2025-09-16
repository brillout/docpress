export { config as default }

import type { Config } from 'vike/types'
import { viteConfig } from './vite.config.js'
import type { Config as DocpressConfig } from './types/Config'
import type { PageSection } from './parsePageSections'
import type { Resolved } from './resolvePageContext.js'
import type { UseMdxComponents } from '@mdx-js/mdx'

const config = {
  name: '@brillout/docpress',
  require: { vike: '>=0.4.234' },
  vite: viteConfig as Record<string, unknown>,
  prerender: { noExtraDir: true },
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  onRenderClient: 'import:@brillout/docpress/renderer/onRenderClient:onRenderClient',
  onCreatePageContext: 'import:@brillout/docpress/renderer/onCreatePageContext:onCreatePageContext',
  clientRouting: true,
  hydrationCanBeAborted: true,
  meta: {
    docpress: {
      env: { server: true, client: true },
      global: true,
    },
  },
  prefetch: {
    staticAssets: 'hover',
    pageContext: Infinity,
  },
} satisfies Config

type ReactComponent = (props?: { components?: ReturnType<UseMdxComponents> }) => React.JSX.Element
declare global {
  namespace Vike {
    interface PageContext {
      Page: ReactComponent
      resolved: Resolved
    }
    interface Config {
      docpress?: DocpressConfig
    }
    interface ConfigResolved {
      docpress: DocpressConfig
      pageSectionsExport: PageSection[] | undefined
    }
  }
}
