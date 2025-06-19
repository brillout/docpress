export { onBeforeRender }

import type { PageContextServer } from 'vike/types'
import { resolvePageContext } from '../config/resolvePageContext'

function onBeforeRender(pageContext: PageContextServer) {
  const pageContextResolved = resolvePageContext(pageContext)
  return {
    pageContext: {
      // pageContextResolved,
    },
  }
}
