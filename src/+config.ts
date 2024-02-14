import type { Config } from 'vike/types'

export default {
  // @ts-expect-error remove this @ts-expect-error once Vike's new version is released
  name: '@brillout/docpress' ,
  onRenderHtml: 'import:@brillout/docpress/renderer/onRenderHtml:onRenderHtml',
  client: 'import:@brillout/docpress/renderer/client:doesNotExist',
  meta: {
    Page: {
      env: { client: false, server: true }
    },
    // Vike already defines the setting 'name', but we redundantly define it here for older Vike versions (otherwise older Vike versions will complain that 'name` is an unknown config).
    name: {
      env: { config: true }
    }
  }
} satisfies Config
