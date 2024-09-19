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
type PageContextOriginal = PageContextServer

type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextOriginal) {
  const pageContextResolved = {}

  objectAssign(pageContextResolved, resolveHeadingsData(pageContext))

  const config = getConfig()
  const { faviconUrl, algolia, tagline, twitterHandle, bannerUrl, websiteUrl } = config
  objectAssign(pageContextResolved, {
    urlPathname: pageContext.urlPathname, // TODO: remove
    meta: {
      faviconUrl,
      twitterHandle,
      bannerUrl,
      websiteUrl,
      tagline,
      algolia,
    },
    config,
  })

  return pageContextResolved
}
