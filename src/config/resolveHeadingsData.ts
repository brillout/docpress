export { resolveHeadingsData }

import { assert, jsxToTextContent } from '../utils/server'
import type {
  HeadingDefinition,
  HeadingDetachedDefinition,
  HeadingResolved,
  HeadingDetachedResolved,
} from '../types/Heading'
import type { Config } from '../types/Config'
import { getConfig } from './getConfig'
import { parseTitle, withEmoji } from '../parseTitle'
import { NavigationData, NavItem } from '../navigation/Navigation'
import type { LinkData } from '../components'
import type { Exports, PageContextOriginal } from './resolvePageContext'

function resolveHeadingsData(pageContext: PageContextOriginal) {
  const config = getConfig()

  {
    const { headings, headingsDetached } = config
    assertHeadingsDefinition([...headings, ...headingsDetached])
  }

  const resolved = getHeadingsResolved(config)
  const { headingsDetachedResolved } = resolved
  let { headingsResolved } = resolved
  const { activeHeading, activeNavigationHeading } = findHeading(
    headingsResolved,
    headingsDetachedResolved,
    pageContext,
  )

  const isDetachedPage = !activeNavigationHeading

  let headingsAll = [...headingsResolved, ...headingsDetachedResolved]
  headingsAll = getHeadingsAll(headingsAll, pageContext, activeHeading)
  const linksAll: LinkData[] = headingsAll

  if (activeNavigationHeading) {
    headingsResolved = getHeadingsAll(headingsResolved, pageContext, activeNavigationHeading)
  }
  const { documentTitle, isLandingPage, pageTitle } = getTitles(
    headingsDetachedResolved,
    activeNavigationHeading,
    pageContext,
    config,
  )

  let navigationData: NavigationData
  {
    const currentUrl: string = pageContext.urlPathname
    const navItemsAll: NavItem[] = headingsResolved
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
  headingsDetachedResolved: HeadingDetachedResolved[],
  activeNavigationHeading: HeadingResolved | null,
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
    pageTitle = headingsDetachedResolved.find((h) => h.url === url)!.title
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
  headingsResolved: HeadingResolved[],
  headingsDetachedResolved: HeadingDetachedResolved[],
  pageContext: { urlOriginal: string; exports: Exports },
): { activeHeading: HeadingResolved | HeadingDetachedResolved; activeNavigationHeading: HeadingResolved | null } {
  let activeNavigationHeading: HeadingResolved | null = null
  let activeHeading: HeadingResolved | HeadingDetachedResolved | null = null
  const { urlOriginal } = pageContext
  assert(urlOriginal)
  headingsResolved.forEach((heading) => {
    if (heading.url === urlOriginal) {
      activeNavigationHeading = heading
      activeHeading = heading
      assert(heading.level === 2, { pageUrl: urlOriginal, heading })
    }
  })
  if (!activeHeading) {
    activeHeading = headingsDetachedResolved.find(({ url }) => urlOriginal === url) ?? null
  }
  if (!activeHeading) {
    throw new Error(
      [
        `Heading not found for URL '${urlOriginal}'`,
        'Heading is defined for following URLs:',
        ...headingsResolved
          .map((h) => `  ${h.url}`)
          .filter(Boolean)
          .sort(),
      ].join('\n'),
    )
  }
  return { activeHeading, activeNavigationHeading }
}

function getHeadingsAll<T extends HeadingResolved | HeadingDetachedResolved>(
  headingsResolved: T[],
  pageContext: { exports: Exports; urlOriginal: string },
  activeHeading: T,
): T[] {
  const headingsAll = headingsResolved.slice()

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
  currentHeading: HeadingResolved | HeadingDetachedResolved,
) {
  const headingsOfCurrentPage: HeadingResolved[] = []

  const pageSections = pageContext.exports.pageSectionsExport ?? []

  pageSections.forEach((pageSection) => {
    const pageSectionTitleJsx = parseTitle(pageSection.pageSectionTitle)
    const url: null | string = pageSection.pageSectionId && '#' + pageSection.pageSectionId
    if (pageSection.pageSectionLevel === 2) {
      const heading: HeadingResolved = {
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

/**
 * - Parse title (from `string` to `JSX.Element`)
 * - Determine navigation breadcrumbs
 */
function getHeadingsResolved(config: {
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
}): {
  headingsResolved: HeadingResolved[]
  headingsDetachedResolved: HeadingDetachedResolved[]
} {
  const headingsWithoutBreadcrumb: Omit<HeadingResolved, 'linkBreadcrumb'>[] = config.headings.map(
    (heading: HeadingDefinition) => {
      const titleParsed: JSX.Element = parseTitle(heading.title)

      const titleInNav = heading.titleInNav || heading.title
      let titleInNavParsed: JSX.Element
      titleInNavParsed = parseTitle(titleInNav)
      if ('titleEmoji' in heading) {
        assert(heading.titleEmoji)
        titleInNavParsed = withEmoji(heading.titleEmoji, titleInNavParsed)
      }

      const headingResolved: Omit<HeadingResolved, 'linkBreadcrumb'> = {
        ...heading,
        title: titleParsed,
        titleInNav: titleInNavParsed,
      }
      return headingResolved
    },
  )

  const headingsResolved: HeadingResolved[] = []
  headingsWithoutBreadcrumb.forEach((heading) => {
    const linkBreadcrumb = getHeadingsBreadcrumb(heading, headingsResolved)
    headingsResolved.push({
      ...heading,
      linkBreadcrumb,
    })
  })

  const headingsDetachedResolved = config.headingsDetached.map((headingsDetached) => {
    const { url, title } = headingsDetached
    assert(
      headingsResolved.find((heading) => heading.url === url) === undefined,
      `remove ${headingsDetached.url} from headingsDetached`,
    )
    const titleParsed = typeof title === 'string' ? parseTitle(title) : title
    return {
      ...headingsDetached,
      level: 2 as const,
      title: titleParsed,
      titleInNav: titleParsed,
      linkBreadcrumb: null,
    }
  })

  return { headingsResolved, headingsDetachedResolved }
}

function getHeadingsBreadcrumb(heading: Omit<HeadingResolved, 'linkBreadcrumb'>, headings: HeadingResolved[]) {
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

function assertHeadingsDefinition(headings: { url?: null | string }[]) {
  headings.forEach((heading) => {
    if (heading.url) {
      const { url } = heading
      assert(url.startsWith('/'))
    }
  })
}
