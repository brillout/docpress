export { resolvePageContext }
export type Resolved = ReturnType<typeof resolvePageContext>

import type { Config } from './types/Config.js'
import type { NavItem } from './NavItemComponent.js'
import type { LinkData } from './components/index.js'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from './parsePageSections.js'
import type {
  HeadingDefinition,
  HeadingDetachedDefinition,
  HeadingResolved,
  HeadingDetachedResolved,
  StringArray,
} from './types/Heading.js'
import { assert, assertUsage } from './utils/assert.js'
import { jsxToTextContent } from './utils/jsxToTextContent.js'
import pc from '@brillout/picocolors'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { determineNavItemsColumnLayout } from './determineNavItemsColumnLayout.js'
import { resolveChoices } from './code-blocks/utils/resolveChoices.js'

type PageSectionResolved = {
  url: string | null
  title: string
  titleInNav: string
  linkBreadcrumb: StringArray
  pageSectionLevel: number
}

function resolvePageContext(pageContext: PageContextServer) {
  const config = pageContext.globalContext.config.docpress
  const { urlPathname } = pageContext
  const pageSections = pageContext.config.pageSectionsExport ?? []

  {
    const { headings, headingsDetached } = config
    assertHeadingsDefinition([...headings, ...headingsDetached])
  }

  const ret = getHeadingsResolved(config)
  const { headingsDetachedResolved } = ret
  let { headingsResolved } = ret

  const { activeHeading, isDetachedPage, activeCategoryName } = getActiveHeading(
    headingsResolved,
    headingsDetachedResolved,
    urlPathname,
  )

  const { documentTitle, isLandingPage, pageTitle } = getTitles(activeHeading, urlPathname, config)

  const pageSectionsResolved = getPageSectionsResolved(pageSections, activeHeading)

  const linksGlobal: LinkData[] = [
    ...headingsResolved.map(headingToLinkData),
    ...headingsDetachedResolved.map(headingToLinkData),
  ]
  const linksPage: LinkData[] = pageSectionsResolved.map(pageSectionToLinkData)
  const linksAll = [...linksPage, ...linksGlobal]

  let navItemsAll: NavItem[]
  let navItemsDetached: NavItem[] | undefined
  {
    const navItemsPageSections = pageSectionsResolved
      .filter((pageSection) => pageSection.pageSectionLevel === 2)
      .map(pageSectionToNavItem)
    navItemsAll = headingsResolved.map(headingToNavItem)
    determineNavItemsColumnLayout(navItemsAll)
    if (isDetachedPage) {
      navItemsDetached = [headingToNavItem(activeHeading), ...navItemsPageSections]
    } else {
      const activeHeadingIndex = navItemsAll.findIndex((navItem) => navItem.url === urlPathname)
      assert(activeHeadingIndex >= 0)
      navItemsPageSections.forEach((navItem, i) => {
        navItemsAll.splice(activeHeadingIndex + 1 + i, 0, navItem)
      })
    }
  }

  // Don't show landing page in navigation
  navItemsAll = navItemsAll.filter((navItem) => navItem.url !== '/')

  const choices = config.choices && resolveChoices(config.choices)

  // "On this page": the page's `##` and `###` headings
  const tocItems: { id: string; title: string; level: number; length: number }[] = []
  for (const pageSection of pageSections) {
    const isTocItem = pageSection.pageSectionId !== null && [2, 3].includes(pageSection.pageSectionLevel)
    if (isTocItem) {
      tocItems.push({
        id: pageSection.pageSectionId!,
        title: pageSection.pageSectionTitle,
        level: pageSection.pageSectionLevel,
        length: 0,
      })
    }
    // A rail item spans its own section and the `####`+ sections below it
    const tocItem = tocItems[tocItems.length - 1]
    if (tocItem) tocItem.length += pageSection.pageSectionLength ?? 0
  }

  const { breadcrumb, pagePrev, pageNext } = getPageNavigation(headingsResolved, urlPathname)

  const resolved = {
    navItemsAll,
    navItemsDetached,
    pageDesign: activeHeading.pageDesign,
    linksAll,
    isLandingPage,
    pageTitle,
    documentTitle,
    activeCategoryName,
    choices,
    tocItems,
    breadcrumb,
    pagePrev,
    pageNext,
  }
  return resolved
}

// The page's place in the navigation: its category and group (breadcrumb), and the pages before and after it
function getPageNavigation(headings: HeadingResolved[], urlPathname: string) {
  type PageLink = { url: string; title: string }
  const pages: PageLink[] = []
  let breadcrumb: string[] = []
  let category: string | null = null
  let group: string | null = null
  for (const heading of headings) {
    if (heading.level === 1) {
      category = heading.titleInNav
      group = null
    }
    if (heading.level === 4) group = heading.titleInNav
    if (heading.level === 2 && heading.url && heading.url !== '/') {
      if (heading.url === urlPathname) breadcrumb = [category, group].filter((title) => title !== null)
      pages.push({ url: heading.url, title: heading.titleInNav })
    }
  }
  const index = pages.findIndex((page) => page.url === urlPathname)
  // Detached pages (not in the navigation) have neither
  const pagePrev: PageLink | null = index > 0 ? pages[index - 1]! : null
  const pageNext: PageLink | null = index !== -1 && index < pages.length - 1 ? pages[index + 1]! : null
  return { breadcrumb, pagePrev, pageNext }
}

function headingToNavItem(heading: HeadingResolved | HeadingDetachedResolved): NavItem {
  return {
    level: heading.level,
    url: heading.url,
    title: heading.title,
    titleInNav: heading.titleInNav,
    menuModalFullWidth: heading.menuModalFullWidth,
    color: heading.color,
    titleIcon: heading.titleIcon,
    titleIconStyle: heading.titleIconStyle,
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

function getTitles(activeHeading: HeadingResolved | HeadingDetachedResolved, urlPathname: string, config: Config) {
  const isLandingPage = urlPathname === '/'

  const { title } = activeHeading
  let pageTitle = isLandingPage ? null : title
  let documentTitle = activeHeading.titleDocument || jsxToTextContent(parseMarkdownMini(title))

  if (!isLandingPage) {
    documentTitle += ' | ' + config.name
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { documentTitle, isLandingPage, pageTitle }
}

function getActiveHeading(
  headingsResolved: HeadingResolved[],
  headingsDetachedResolved: HeadingDetachedResolved[],
  urlPathname: string,
) {
  const URLs =
    '\n' +
    [...headingsResolved, ...headingsDetachedResolved]
      .map((h) => h.url)
      .filter(Boolean)
      .sort()
      .map((url) => `  ${url}`)
      .join('\n')
  const errNotFound = `URL ${pc.bold(urlPathname)} not found in following URLs:${URLs}`
  const errFoundTwice = `URL ${pc.bold(urlPathname)} found twice in following URLs:${URLs}`
  let activeHeading: HeadingResolved | HeadingDetachedResolved | null = null
  let activeCategoryName = 'Miscellaneous'
  let headingCategory: string | undefined
  assert(urlPathname)
  for (const heading of headingsResolved) {
    if (heading.level === 1) {
      headingCategory = heading.title
    }
    if (heading.url === urlPathname) {
      assertUsage(!activeHeading, errFoundTwice)
      activeHeading = heading
      assert(headingCategory)
      activeCategoryName = headingCategory
      assert(heading.level === 2, { pageUrl: urlPathname, heading })
      break
    }
  }
  const isDetachedPage = !activeHeading
  if (!activeHeading) {
    const found = headingsDetachedResolved.filter(({ url }) => urlPathname === url)
    if (found.length > 0) {
      assertUsage(found.length === 1, errFoundTwice)
      assertUsage(!activeHeading, errFoundTwice)
      activeHeading = found[0]!
    }
  }
  assertUsage(activeHeading, errNotFound)
  if (activeHeading.category) activeCategoryName = activeHeading.category
  return { activeHeading, isDetachedPage, activeCategoryName }
}

function getPageSectionsResolved(
  pageSections: PageSection[],
  activeHeading: HeadingResolved | HeadingDetachedResolved,
): PageSectionResolved[] {
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
