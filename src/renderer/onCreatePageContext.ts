export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolvePageContext } from '../resolvePageContext'

function onCreatePageContext(pageContext: PageContextServer) {
  pageContext.resolved = resolvePageContext(pageContext)
}
