import type { Config } from 'vike/types'

export default {
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  client: 'import:@brillout/docpress/renderer/client:doesNotExist',
  meta: {
    Page: {
      env: { client: false, server: true }
    }
  }
} satisfies Config
