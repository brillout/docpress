export { resolvePageContext }
export type { PageContextOriginal }
export type { PageContextResolved }
export type { Exports }

import { objectAssign } from '../utils/server'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from '../parsePageSections'
import { resolveHeadingsData } from './resolveHeadingsData'

type Exports = {
  pageSectionsExport?: PageSection[]
}
// TODO/refactor: remove PageContextOriginal in favor of using PageContextServer
type PageContextOriginal = PageContextServer

type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextOriginal) {
  const pageContextResolved = {}

  const pageContextHeadingsData = resolveHeadingsData(pageContext)
  objectAssign(pageContextResolved, pageContextHeadingsData)

  return pageContextResolved
}
