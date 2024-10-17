export { resolvePageContext }
export type { PageContextOriginal }
export type { PageContextResolved }
export type { Exports }

import { objectAssign } from '../utils/server'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from '../parsePageSections'
import { getConfig } from './getConfig'
import { resolveHeadingsData } from './resolveHeadingsData'

type Exports = {
  pageSectionsExport?: PageSection[]
}
// TODO/refactor: remove PageContextOriginal in favor of using PageContextServer
type PageContextOriginal = PageContextServer

type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextOriginal) {
  const pageContextResolved = {}

  objectAssign(pageContextResolved, resolveHeadingsData(pageContext))

  const config = getConfig()
  const {
    faviconUrl,
    algolia,
    tagline,
    twitterHandle,
    bannerUrl,
    websiteUrl,
    topNavigationStyle,
    projectInfo: { projectName },
  } = config
  objectAssign(pageContextResolved, {
    urlPathname: pageContext.urlPathname, // TODO: remove
    meta: {
      projectName,
      faviconUrl,
      twitterHandle,
      bannerUrl,
      websiteUrl,
      tagline,
      algolia,
    },
    topNavigationStyle,
    config,
  })

  return pageContextResolved
}
