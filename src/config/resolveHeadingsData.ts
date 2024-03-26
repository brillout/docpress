export { resolveHeadingsData }

import { assert, jsxToTextContent } from '../utils/server'
import type { HeadingDefinition, HeadingDetachedDefinition, Heading, HeadingDetached } from '../types/Heading'
import type { Config } from '../types/Config'
import { getConfig } from './getConfig'
import { parseTitle, withEmoji } from '../parseTitle'
import { NavigationData, NavItem } from '../navigation/Navigation'
import type { LinkData } from '../components'
import type { Exports, PageContextOriginal } from './resolvePageContext'

function resolveHeadingsData(pageContext: PageContextOriginal) {
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
  const linksAll: LinkData[] = headingsAll

  if (activeNavigationHeading) {
    headingsProcessed = getHeadingsAll(headingsProcessed, pageContext, activeNavigationHeading)
  }
  const { documentTitle, isLandingPage, pageTitle } = getTitles(
    headingsDetachedProcessed,
    activeNavigationHeading,
    pageContext,
    config,
  )

  let navigationData: NavigationData
  {
    const currentUrl: string = pageContext.urlPathname
    const navItemsAll: NavItem[] = headingsProcessed
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

  const pageContextAddendum = {
    navigationData,
    linksAll,
    isLandingPage,
    pageTitle,
    documentTitle,
  }
  return pageContextAddendum
}

function getTitles(
  headingsDetachedProcessed: HeadingDetached[],
  activeNavigationHeading: Heading | null,
  pageContext: { urlOriginal: string; exports: Exports },
  config: Config,
) {
  const url = pageContext.urlOriginal

  let documentTitle: string
  let pageTitle: string | JSX.Element | null
  if (activeNavigationHeading) {
    documentTitle = activeNavigationHeading.titleDocument || jsxToTextContent(activeNavigationHeading.title)
    pageTitle = activeNavigationHeading.title
  } else {
    pageTitle = headingsDetachedProcessed.find((h) => h.url === url)!.title
    documentTitle = jsxToTextContent(pageTitle)
  }

  const isLandingPage = url === '/'
  if (!isLandingPage) {
    documentTitle += ' | ' + config.projectInfo.projectName
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { documentTitle, isLandingPage, pageTitle }
}

function findHeading(
  headingsProcessed: Heading[],
  headingsDetachedProcessed: HeadingDetached[],
  pageContext: { urlOriginal: string; exports: Exports },
): { activeHeading: Heading | HeadingDetached; activeNavigationHeading: Heading | null } {
  let activeNavigationHeading: Heading | null = null
  let activeHeading: Heading | HeadingDetached | null = null
  const { urlOriginal } = pageContext
  assert(urlOriginal)
  headingsProcessed.forEach((heading) => {
    if (heading.url === urlOriginal) {
      activeNavigationHeading = heading
      activeHeading = heading
      assert(heading.level === 2, { pageUrl: urlOriginal, heading })
    }
  })
  if (!activeHeading) {
    activeHeading = headingsDetachedProcessed.find(({ url }) => urlOriginal === url) ?? null
  }
  if (!activeHeading) {
    throw new Error(
      [
        `Heading not found for URL '${urlOriginal}'`,
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

function getHeadingsWithProcessedTitle(config: {
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
}): {
  headingsProcessed: Heading[]
  headingsDetachedProcessed: HeadingDetached[]
} {
  const headingsWithoutBreadcrumb: Omit<Heading, 'linkBreadcrumb'>[] = config.headings.map(
    (heading: HeadingDefinition) => {
      const titleProcessed: JSX.Element = parseTitle(heading.title)

      const titleInNav = heading.titleInNav || heading.title
      let titleInNavProcessed: JSX.Element
      titleInNavProcessed = parseTitle(titleInNav)
      if ('titleEmoji' in heading) {
        assert(heading.titleEmoji)
        titleInNavProcessed = withEmoji(heading.titleEmoji, titleInNavProcessed)
      }

      const headingProcessed: Omit<Heading, 'linkBreadcrumb'> = {
        ...heading,
        title: titleProcessed,
        titleInNav: titleInNavProcessed,
      }
      return headingProcessed
    },
  )

  const headingsProcessed: Heading[] = []
  headingsWithoutBreadcrumb.forEach((heading) => {
    const linkBreadcrumb = getHeadingsBreadcrumb(heading, headingsProcessed)
    headingsProcessed.push({
      ...heading,
      linkBreadcrumb,
    })
  })

  const headingsDetachedProcessed = config.headingsDetached.map((headingsDetached) => {
    const { url, title } = headingsDetached
    assert(
      headingsProcessed.find((heading) => heading.url === url) === undefined,
      `remove ${headingsDetached.url} from headingsDetached`,
    )
    const titleProcessed = typeof title === 'string' ? parseTitle(title) : title
    return {
      ...headingsDetached,
      level: 2 as const,
      title: titleProcessed,
      titleInNav: titleProcessed,
      linkBreadcrumb: null,
    }
  })

  assertHeadingsUrl([...headingsProcessed, ...headingsDetachedProcessed])
  return { headingsProcessed, headingsDetachedProcessed }
}

function getHeadingsBreadcrumb(heading: Omit<Heading, 'linkBreadcrumb'>, headings: Heading[]) {
  const linkBreadcrumb: JSX.Element[] = []
  let levelCurrent = heading.level
  headings
    .slice()
    .reverse()
    .forEach((parentCandidate) => {
      const isParent = parentCandidate.level < levelCurrent
      if (isParent) {
        levelCurrent = parentCandidate.level
        linkBreadcrumb.push(parentCandidate.title)
      }
    })
  return linkBreadcrumb
}

function assertHeadingsUrl(headings: { url?: null | string }[]) {
  headings.forEach((heading) => {
    if (heading.url) {
      const { url } = heading
      assert(url.startsWith('/'))
    }
  })
}
