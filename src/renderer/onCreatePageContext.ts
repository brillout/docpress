export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveConf } from '../resolveConf'
import { objectAssign } from '../utils/objectAssign'

function onCreatePageContext(pageContext: PageContextServer) {
  const conf = resolveConf(pageContext)
  objectAssign(pageContext, { pageContextResolved: conf })
}
