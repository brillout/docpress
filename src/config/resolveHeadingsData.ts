export { resolveHeadingsData }

import { assert, isBrowser, jsxToTextContent } from '../utils/server'
import type {
  HeadingDefinition,
  HeadingDetachedDefinition,
  HeadingResolved,
  HeadingDetachedResolved,
} from '../types/Heading'
import type { Config } from '../types/Config'
import { getConfig } from './getConfig'
import type { NavItem } from '../navigation/Navigation'
import type { LinkData } from '../components'
import type { Exports, PageContextOriginal } from './resolvePageContext'
import pc from '@brillout/picocolors'
import { parseTitle } from '../parseTitle'
import { determineColumnEntries } from '../renderer/determineColumnEntries'
assert(!isBrowser())

type PageSectionResolved = {
  url: string | null
  title: string
  titleInNav: string
  linkBreadcrumb: string[]
  pageSectionLevel: number
}

function resolveHeadingsData(pageContext: PageContextOriginal) {
  const config = getConfig()

  {
    const { headings, headingsDetached } = config
    assertHeadingsDefinition([...headings, ...headingsDetached])
  }

  const resolved = getHeadingsResolved(config)
  const { headingsDetachedResolved } = resolved
  let { headingsResolved } = resolved

  const { activeHeading, isDetachedPage, activeCategory } = getActiveHeading(
    headingsResolved,
    headingsDetachedResolved,
    pageContext,
  )

  const { documentTitle, isLandingPage, pageTitle } = getTitles(activeHeading, pageContext, config)

  const pageSectionsResolved = getPageSectionsResolved(pageContext, activeHeading)

  const linksAll: LinkData[] = [
    ...pageSectionsResolved.map(pageSectionToLinkData),
    ...headingsResolved.map(headingToLinkData),
    ...headingsDetachedResolved.map(headingToLinkData),
  ]

  // TODO/refactor: remove navItems
  let navItems: NavItem[]
  let navItemsAll: NavItem[]
  {
    const navItemsPageSections = pageSectionsResolved
      .filter((pageSection) => pageSection.pageSectionLevel === 2)
      .map(pageSectionToNavItem)
    navItemsAll = headingsResolved.map(headingToNavItem)
    determineColumnEntries(navItemsAll)
    if (isDetachedPage) {
      navItems = [headingToNavItem(activeHeading), ...navItemsPageSections]
    } else {
      navItems = navItemsAll
      const activeHeadingIndex = navItemsAll.findIndex((navItem) => navItem.url === pageContext.urlPathname)
      assert(activeHeadingIndex >= 0)
      navItemsPageSections.forEach((navItem, i) => {
        navItemsAll.splice(activeHeadingIndex + 1 + i, 0, navItem)
      })
    }
  }

  const pageContextAddendum = {
    isDetachedPage,
    navItems,
    navItemsAll,
    linksAll,
    isLandingPage,
    pageTitle,
    documentTitle,
    // TODO: don't pass to client-side
    activeCategory,
  }
  return pageContextAddendum
}

function headingToNavItem(heading: HeadingResolved | HeadingDetachedResolved): NavItem {
  return {
    level: heading.level,
    url: heading.url,
    title: heading.title,
    titleInNav: heading.titleInNav,
    menuModalFullWidth: heading.menuModalFullWidth,
    color: heading.color,
  }
}
function headingToLinkData(heading: HeadingResolved | HeadingDetachedResolved): LinkData {
  return {
    url: heading.url,
    title: heading.title,
    linkBreadcrumb: heading.linkBreadcrumb,
    sectionTitles: heading.sectionTitles,
  }
}
function pageSectionToNavItem(pageSection: PageSectionResolved): NavItem {
  return {
    level: pageSection.pageSectionLevel + 1,
    url: pageSection.url,
    title: pageSection.title,
    titleInNav: pageSection.titleInNav,
  }
}
function pageSectionToLinkData(pageSection: PageSectionResolved): LinkData {
  return {
    url: pageSection.url,
    title: pageSection.title,
    linkBreadcrumb: pageSection.linkBreadcrumb,
  }
}

function getTitles(
  activeHeading: HeadingResolved | HeadingDetachedResolved,
  pageContext: { urlPathname: string },
  config: Config,
) {
  const url = pageContext.urlPathname
  const isLandingPage = url === '/'

  const { title } = activeHeading
  let pageTitle = isLandingPage ? null : title
  let documentTitle = activeHeading.titleDocument || jsxToTextContent(parseTitle(title))

  if (!isLandingPage) {
    documentTitle += ' | ' + config.projectInfo.projectName
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { documentTitle, isLandingPage, pageTitle }
}

function getActiveHeading(
  headingsResolved: HeadingResolved[],
  headingsDetachedResolved: HeadingDetachedResolved[],
  pageContext: { urlPathname: string; exports: Exports },
) {
  let activeHeading: HeadingResolved | HeadingDetachedResolved | null = null
  let activeCategory = 'Miscellaneous'
  let headingCategory: string | undefined
  const { urlPathname } = pageContext
  assert(urlPathname)
  for (const heading of headingsResolved) {
    if (heading.level === 1) {
      headingCategory = heading.title
    }
    if (heading.url === urlPathname) {
      activeHeading = heading
      assert(headingCategory)
      activeCategory = headingCategory
      assert(heading.level === 2, { pageUrl: urlPathname, heading })
      break
    }
  }
  const isDetachedPage = !activeHeading
  if (!activeHeading) {
    activeHeading = headingsDetachedResolved.find(({ url }) => urlPathname === url) ?? null
  }
  if (!activeHeading) {
    throw new Error(
      [
        `URL ${pc.bold(urlPathname)} not found in following URLs:`,
        [...headingsResolved, ...headingsDetachedResolved]
          .filter(Boolean)
          .map((h) => h.url)
          .sort()
          .map((url) => `  ${url}`)
          .join('\n'),
      ].join('\n'),
    )
  }
  if (activeHeading.category) activeCategory = activeHeading.category
  return { activeHeading, isDetachedPage, activeCategory }
}

function getPageSectionsResolved(
  pageContext: { exports: Exports },
  activeHeading: HeadingResolved | HeadingDetachedResolved,
): PageSectionResolved[] {
  const pageSections = pageContext.exports.pageSectionsExport ?? []

  const pageSectionsResolved = pageSections.map((pageSection) => {
    const { pageSectionTitle } = pageSection
    const url: null | string = pageSection.pageSectionId === null ? null : '#' + pageSection.pageSectionId
    const pageSectionResolved: PageSectionResolved = {
      url,
      title: pageSectionTitle,
      linkBreadcrumb: [activeHeading.title, ...(activeHeading.linkBreadcrumb ?? [])],
      titleInNav: pageSectionTitle,
      pageSectionLevel: pageSection.pageSectionLevel,
    }
    return pageSectionResolved
  })

  if (activeHeading?.sectionTitles) {
    activeHeading.sectionTitles.forEach((sectionTitle) => {
      const pageSectionTitles = pageSections.map((h) => h.pageSectionTitle)
      assert(pageSectionTitles.includes(sectionTitle), { pageHeadingTitles: pageSectionTitles, sectionTitle })
    })
  }

  return pageSectionsResolved
}

function getHeadingsResolved(config: {
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
}): {
  headingsResolved: HeadingResolved[]
  headingsDetachedResolved: HeadingDetachedResolved[]
} {
  const headingsWithoutBreadcrumb: Omit<HeadingResolved, 'linkBreadcrumb'>[] = config.headings.map(
    (heading: HeadingDefinition) => {
      const titleInNav = heading.titleInNav || heading.title
      const headingResolved: Omit<HeadingResolved, 'linkBreadcrumb'> = {
        ...heading,
        titleInNav,
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
    const { url } = headingsDetached
    assert(
      headingsResolved.find((heading) => heading.url === url) === undefined,
      `remove ${headingsDetached.url} from headingsDetached`,
    )
    return {
      ...headingsDetached,
      level: 2 as const,
      titleInNav: headingsDetached.title,
      linkBreadcrumb: null,
    }
  })

  return { headingsResolved, headingsDetachedResolved }
}

function getHeadingsBreadcrumb(heading: Omit<HeadingResolved, 'linkBreadcrumb'>, headings: HeadingResolved[]) {
  const linkBreadcrumb: string[] = []
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
