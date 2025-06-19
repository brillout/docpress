export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveConfig } from '../resolveConfig'
import { objectAssign } from '../utils/objectAssign'

function onCreatePageContext(pageContext: PageContextServer) {
  const pageContextAddendum = resolveConfig(pageContext)
  objectAssign(pageContext, { pageContextResolved: pageContextAddendum })
}
