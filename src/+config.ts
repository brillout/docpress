import type { Config } from 'vike/types'
import type { Exports } from './config/resolvePageContext'

export default {
  // @ts-ignore Remove this ts-ignore once Vike's new version is released.
  name: '@brillout/docpress',
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  onRenderClient: 'import:@brillout/docpress/renderer/onRenderClient:onRenderClient',
  onBeforeRender: 'import:@brillout/docpress/renderer/onBeforeRender:onBeforeRender',
  clientRouting: true,
  hydrationCanBeAborted: true,
  passToClient: ['pageContextResolved'],
  meta: {
    NavHeader: {
      env: { client: true, server: true }
    },
  },
} satisfies Config

type ReactComponent = () => JSX.Element
declare global {
  namespace Vike {
    interface PageContext {
      Page: ReactComponent
      exports: Exports
    }
    interface Config {
      NavHeader?: {
        NavHeader: ReactComponent
        navHeaderWrapperStyle?: React.CSSProperties
        NavHeaderMobile: ReactComponent
        navHeaderMobileWrapperStyle?: React.CSSProperties
      }
    }
  }
}
