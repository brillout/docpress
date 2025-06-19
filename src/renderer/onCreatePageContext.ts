export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveConfig } from '../config/resolveConfig'
import { objectAssign } from '../utils/objectAssign'

function onCreatePageContext(pageContext: PageContextServer) {
  const pageContextAddendum = resolveConfig(pageContext)
  objectAssign(pageContext, { pageContextResolved: pageContextAddendum })
}
