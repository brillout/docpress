export { onCreatePageContext }

import type { PageContextServer } from 'vike/types'
import { resolveHeadings } from '../config/resolveHeadings'
import { objectAssign } from '../utils/objectAssign'

function onCreatePageContext(pageContext: PageContextServer) {
  const pageContextAddendum = resolveHeadings(pageContext)
  objectAssign(pageContext, { pageContextResolved: pageContextAddendum })
}
