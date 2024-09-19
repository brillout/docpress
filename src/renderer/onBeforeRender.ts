export { onBeforeRender }

import { resolvePageContext, type PageContextOriginal, type PageContextResolved } from '../config/resolvePageContext'

/*
declare global {
  namespace Vike {
    interface PageContext {
      pageContextResolved: PageContextResolved
    }
  }
}
*/

function onBeforeRender(pageContextOriginal: PageContextOriginal) {
  const pageContextResolved = resolvePageContext(pageContextOriginal)
  return {
    pageContext: {
      pageContextResolved,
    },
  }
}
