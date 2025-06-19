export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveHeadingsData } from '../config/resolveHeadingsData'
import { objectAssign } from '../utils/objectAssign'

function onCreatePageContext(pageContext: PageContextServer) {
  const pageContextAddendum = resolveHeadingsData(pageContext)
  // objectAssign(pageContext, { pageContextResolved: pageContextAddendum })
}
