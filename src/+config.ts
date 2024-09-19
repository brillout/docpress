import type { Config } from 'vike/types'

export default {
  // @ts-ignore Remove this ts-ignore once Vike's new version is released.
  name: '@brillout/docpress',
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  client: 'import:@brillout/docpress/renderer/client:doesNotExist',
  meta: {
    Page: {
      env: { client: false, server: true },
    },
  },
} satisfies Config
