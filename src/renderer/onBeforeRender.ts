export { onBeforeRender }

import { resolvePageContext, type PageContextOriginal } from '../config/resolvePageContext'

function onBeforeRender(pageContextOriginal: PageContextOriginal) {
  const pageContextResolved = resolvePageContext(pageContextOriginal)
  return {
    pageContext: {
      // pageContextResolved,
    },
  }
}
