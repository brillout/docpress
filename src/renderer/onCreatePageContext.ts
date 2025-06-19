export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveConf } from '../resolveConf'

function onCreatePageContext(pageContext: PageContextServer) {
  pageContext.conf = resolveConf(pageContext)
}
