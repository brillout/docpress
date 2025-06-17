export { resolvePageContext }
export type { PageContextResolved }
export type { Exports }

import { objectAssign } from '../utils/server'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from '../parsePageSections'
import { resolveHeadingsData } from './resolveHeadingsData'

type Exports = {
  pageSectionsExport?: PageSection[]
}
type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextServer) {
  const pageContextResolved = {}

  const pageContextHeadingsData = resolveHeadingsData(pageContext)
  objectAssign(pageContextResolved, pageContextHeadingsData)

  return pageContextResolved
}
