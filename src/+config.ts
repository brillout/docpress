import type { Config } from 'vike/types'

export default {
  // @ts-ignore Remove this ts-ignore once Vike's new version is released.
  name: '@brillout/docpress',
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  onRenderClient: 'import:@brillout/docpress/renderer/onRenderClient:onRenderClient',
  onBeforeRender: 'import:@brillout/docpress/renderer/onBeforeRender:onBeforeRender',
  clientRouting: true,
  hydrationCanBeAborted: true,
  passToClient: ['pageContextResolved'],
  client: 'import:@brillout/docpress/renderer/client:doesNotExist',
} satisfies Config
