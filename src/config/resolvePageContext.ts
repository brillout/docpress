import { assert, jsxToTextContent, objectAssign } from '../utils/server'
import type { Heading, HeadingDetached } from '../types/Heading'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from '../parsePageSections'
import type { Config } from '../types/Config'
import { getConfig } from './getConfig'
import { getHeadingsWithProcessedTitle, parseTitle } from '../parseTitle'
import { NavigationData, NavItem } from '../navigation/Navigation'
import { LinkData } from '../components'

export { resolvePageContext }
export type { PageContextOriginal }
export type { PageContextResolved }
export type { Heading }

type ReactComponent = () => JSX.Element
type Exports = {
  pageSectionsExport?: PageSection[]
}
type PageContextOriginal = PageContextServer & {
  Page: ReactComponent
  exports: Exports
}
type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextOriginal) {
  const config = getConfig()
  const processed = getHeadingsWithProcessedTitle(config)
  const { headingsDetachedProcessed } = processed
  let { headingsProcessed } = processed
  const { activeHeading, activeNavigationHeading } = findHeading(
    headingsProcessed,
    headingsDetachedProcessed,
    pageContext,
  )

  const isDetachedPage = !activeNavigationHeading

  let headingsAll = [...headingsProcessed, ...headingsDetachedProcessed]
  headingsAll = getHeadingsAll(headingsAll, pageContext, activeHeading)
  const linkAll: LinkData[] = headingsAll

  if (activeNavigationHeading) {
    headingsProcessed = getHeadingsAll(headingsProcessed, pageContext, activeNavigationHeading)
  } else {
  }
  const { title, isLandingPage, pageTitle } = getMetaData(
    headingsDetachedProcessed,
    activeNavigationHeading,
    pageContext,
    config,
  )
  const { faviconUrl, algolia, tagline, twitterHandle, bannerUrl, websiteUrl } = config

  const pageContextResolved = {}
  objectAssign(pageContextResolved, {
    ...pageContext,
    meta: {
      title,
      faviconUrl,
      twitterHandle,
      bannerUrl,
      websiteUrl,
      tagline,
      algolia,
    },
    linkAll,
    isLandingPage,
    pageTitle,
    config,
  })

  let navigationData: NavigationData
  {
    const currentUrl = pageContext.urlPathname
    const navItemsAll = headingsProcessed
    if (isDetachedPage) {
      const navItems: NavItem[] = [activeHeading, ...getHeadingsOfTheCurrentPage(pageContext, activeHeading)]
      navigationData = {
        isDetachedPage: true,
        navItems,
        navItemsAll,
        currentUrl,
      }
    } else {
      navigationData = {
        isDetachedPage: false,
        navItems: navItemsAll,
        navItemsAll,
        currentUrl,
      }
    }
  }
  objectAssign(pageContextResolved, { navigationData })

  return pageContextResolved
}

function getMetaData(
  headingsDetachedProcessed: HeadingDetached[],
  activeNavigationHeading: Heading | null,
  pageContext: { urlOriginal: string; exports: Exports },
  config: Config,
) {
  const url = pageContext.urlOriginal

  let title: string
  let pageTitle: string | JSX.Element | null
  if (activeNavigationHeading) {
    title = activeNavigationHeading.titleDocument || jsxToTextContent(activeNavigationHeading.title)
    pageTitle = activeNavigationHeading.title
  } else {
    pageTitle = headingsDetachedProcessed.find((h) => h.url === url)!.title
    title = jsxToTextContent(pageTitle)
  }

  const isLandingPage = url === '/'
  if (!isLandingPage) {
    title += ' | ' + config.projectInfo.projectName
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { title, isLandingPage, pageTitle }
}

function findHeading(
  headingsProcessed: Heading[],
  headingsDetachedProcessed: HeadingDetached[],
  pageContext: { urlOriginal: string; exports: Exports },
): { activeHeading: Heading | HeadingDetached; activeNavigationHeading: Heading | null } {
  let activeNavigationHeading: Heading | null = null
  let activeHeading: Heading | HeadingDetached | null = null
  assert(pageContext.urlOriginal)
  const pageUrl = pageContext.urlOriginal
  headingsProcessed.forEach((heading) => {
    if (heading.url === pageUrl) {
      activeNavigationHeading = heading
      activeHeading = heading
      assert(heading.level === 2, { pageUrl, heading })
    }
  })
  if (!activeHeading) {
    activeHeading = headingsDetachedProcessed.find(({ url }) => pageUrl === url) ?? null
  }
  if (!activeHeading) {
    throw new Error(
      [
        `Heading not found for URL '${pageUrl}'`,
        'Heading is defined for following URLs:',
        ...headingsProcessed
          .map((h) => `  ${h.url}`)
          .filter(Boolean)
          .sort(),
      ].join('\n'),
    )
  }
  return { activeHeading, activeNavigationHeading }
}

function getHeadingsAll<T extends Heading | HeadingDetached>(
  headingsProcessed: T[],
  pageContext: { exports: Exports; urlOriginal: string },
  activeHeading: T,
): T[] {
  const headingsAll = headingsProcessed.slice()

  const headingsOfTheCurrentPage = getHeadingsOfTheCurrentPage(pageContext, activeHeading)

  const activeHeadingIndex = headingsAll.indexOf(activeHeading)
  assert(activeHeadingIndex >= 0)
  headingsOfTheCurrentPage.forEach((pageHeading, i) => {
    headingsAll.splice(activeHeadingIndex + 1 + i, 0, pageHeading as T)
  })

  return headingsAll
}

function getHeadingsOfTheCurrentPage(
  pageContext: { exports: Exports; urlOriginal: string },
  currentHeading: Heading | HeadingDetached,
) {
  const headingsOfCurrentPage: Heading[] = []

  const pageSections = pageContext.exports.pageSectionsExport ?? []

  pageSections.forEach((pageSection) => {
    const pageSectionTitleJsx = parseTitle(pageSection.pageSectionTitle)
    const url: null | string = pageSection.pageSectionId && '#' + pageSection.pageSectionId
    if (pageSection.pageSectionLevel === 2) {
      const heading: Heading = {
        url,
        title: pageSectionTitleJsx,
        linkBreadcrumb: [currentHeading.title, ...(currentHeading.linkBreadcrumb ?? [])],
        titleInNav: pageSectionTitleJsx,
        level: 3,
      }
      headingsOfCurrentPage.push(heading)
    }
  })

  if (currentHeading?.sectionTitles) {
    currentHeading.sectionTitles.forEach((sectionTitle) => {
      const pageSectionTitles = pageSections.map((h) => h.pageSectionTitle)
      assert(pageSectionTitles.includes(sectionTitle), { pageHeadingTitles: pageSectionTitles, sectionTitle })
    })
  }

  return headingsOfCurrentPage
}
