export { resolvePageContext }
export type { PageContextResolved }

import { objectAssign } from '../utils/server'
import type { PageContextServer } from 'vike/types'
import { resolveHeadingsData } from './resolveHeadingsData'

type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextServer) {
  const pageContextResolved = {}

  const pageContextHeadingsData = resolveHeadingsData(pageContext)
  objectAssign(pageContextResolved, pageContextHeadingsData)

  return pageContextResolved
}
