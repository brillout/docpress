export { resolvePageContext }
export type Resolved = ReturnType<typeof resolvePageContext>

import type { Config } from './types/Config'
import type { NavItem } from './NavItemComponent'
import type { LinkData } from './components'
import type { PageContextServer } from 'vike/types'
import type { PageSection } from './parsePageSections'
import type {
  MenuDefinition,
  MenuDetachedDefinition,
  MenuResolved,
  MenuDetachedResolved,
  StringArray,
} from './types/Heading'
import { assert, assertUsage } from './utils/assert'
import { jsxToTextContent } from './utils/jsxToTextContent'
import pc from '@brillout/picocolors'
import { parseMarkdownMini } from './parseMarkdownMini'
import { determineNavItemsColumnLayout } from './determineNavItemsColumnLayout'

type PageSectionResolved = {
  url: string | null
  title: string
  titleInNav: string
  linkBreadcrumb: StringArray
  pageSectionLevel: number
}

function resolvePageContext(pageContext: PageContextServer) {
  const menuConfig = pageContext.globalContext.config.menu
  const docpressConfig = pageContext.globalContext.config.docpress
  const { urlPathname } = pageContext
  const pageSections = pageContext.config.pageSectionsExport ?? []

  {
    const { menusMain, menusDetached } = menuConfig
    assertHeadingsDefinition([...menusMain, ...menusDetached])
  }

  const ret = getHeadingsResolved(menuConfig)
  const { menusDetachedResolved } = ret
  let { menusMainResolved } = ret

  const { activeMenu, isDetachedPage, activeCategoryName } = getActiveHeading(
    menusMainResolved,
    menusDetachedResolved,
    urlPathname,
  )

  const { documentTitle, isLandingPage, pageTitle } = getTitles(activeMenu, urlPathname, docpressConfig)

  const pageSectionsResolved = getPageSectionsResolved(pageSections, activeMenu)

  const linksGlobal: LinkData[] = [
    ...menusMainResolved.map(menuToLinkData),
    ...menusDetachedResolved.map(menuToLinkData),
  ]
  const linksPage: LinkData[] = pageSectionsResolved.map(pageSectionToLinkData)
  const linksAll = [...linksPage, ...linksGlobal]

  let navItemsAll: NavItem[]
  let navItemsDetached: NavItem[] | undefined
  {
    const navItemsPageSections = pageSectionsResolved
      .filter((pageSection) => pageSection.pageSectionLevel === 2)
      .map(pageSectionToNavItem)
    navItemsAll = menusMainResolved.map(menuToNavItem)
    determineNavItemsColumnLayout(navItemsAll)
    if (isDetachedPage) {
      navItemsDetached = [menuToNavItem(activeMenu), ...navItemsPageSections]
    } else {
      const activeMenuIndex = navItemsAll.findIndex((navItem) => navItem.url === urlPathname)
      assert(activeMenuIndex >= 0)
      navItemsPageSections.forEach((navItem, i) => {
        navItemsAll.splice(activeMenuIndex + 1 + i, 0, navItem)
      })
    }
  }

  const resolved = {
    navItemsAll,
    navItemsDetached,
    pageDesign: activeMenu.pageDesign,
    linksAll,
    isLandingPage,
    pageTitle,
    documentTitle,
    activeCategoryName,
    menu: {
      menusMain: menusMainResolved,
      menusDetached: menusDetachedResolved,
    },
  }
  return resolved
}

function menuToNavItem(menu: MenuResolved | MenuDetachedResolved): NavItem {
  return {
    level: menu.level,
    url: menu.url,
    title: menu.title,
    titleInNav: menu.titleInNav,
    menuModalFullWidth: menu.menuModalFullWidth,
    color: menu.color,
    titleIcon: menu.titleIcon,
    titleIconStyle: menu.titleIconStyle,
  }
}
function menuToLinkData(menu: MenuResolved | MenuDetachedResolved): LinkData {
  return {
    url: menu.url,
    title: menu.title,
    linkBreadcrumb: menu.linkBreadcrumb,
    sectionTitles: menu.sectionTitles,
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

function getTitles(activeMenu: MenuResolved | MenuDetachedResolved, urlPathname: string, config: Config) {
  const isLandingPage = urlPathname === '/'

  const { title } = activeMenu
  let pageTitle = isLandingPage ? null : title
  let documentTitle = activeMenu.titleDocument || jsxToTextContent(parseMarkdownMini(title))

  if (!isLandingPage) {
    documentTitle += ' | ' + config.name
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { documentTitle, isLandingPage, pageTitle }
}

function getActiveHeading(
  menusResolved: MenuResolved[],
  menusDetachedResolved: MenuDetachedResolved[],
  urlPathname: string,
) {
  const URLs =
    '\n' +
    [...menusResolved, ...menusDetachedResolved]
      .filter(Boolean)
      .map((h) => h.url)
      .sort()
      .map((url) => `  ${url}`)
      .join('\n')
  const errNotFound = `URL ${pc.bold(urlPathname)} not found in following URLs:${URLs}`
  const errFoundTwice = `URL ${pc.bold(urlPathname)} found twice in following URLs:${URLs}`
  let activeMenu: MenuResolved | MenuDetachedResolved | null = null
  let activeCategoryName = 'Miscellaneous'
  let menuCategory: string | undefined
  assert(urlPathname)
  for (const menu of menusResolved) {
    if (menu.level === 1) {
      menuCategory = menu.title
    }
    if (menu.url === urlPathname) {
      assertUsage(!activeMenu, errFoundTwice)
      activeMenu = menu
      assert(menuCategory)
      activeCategoryName = menuCategory
      assert(menu.level === 2, { pageUrl: urlPathname, menu })
      break
    }
  }
  const isDetachedPage = !activeMenu
  if (!activeMenu) {
    const found = menusDetachedResolved.filter(({ url }) => urlPathname === url)
    if (found.length > 0) {
      assertUsage(found.length === 1, errFoundTwice)
      assertUsage(!activeMenu, errFoundTwice)
      activeMenu = found[0]!
    }
  }
  assertUsage(activeMenu, errNotFound)
  if (activeMenu.category) activeCategoryName = activeMenu.category
  return { activeMenu, isDetachedPage, activeCategoryName }
}

function getPageSectionsResolved(
  pageSections: PageSection[],
  activeMenu: MenuResolved | MenuDetachedResolved,
): PageSectionResolved[] {
  const pageSectionsResolved = pageSections.map((pageSection) => {
    const { pageSectionTitle } = pageSection
    const url: null | string = pageSection.pageSectionId === null ? null : '#' + pageSection.pageSectionId
    const pageSectionResolved: PageSectionResolved = {
      url,
      title: pageSectionTitle,
      linkBreadcrumb: [activeMenu.title, ...(activeMenu.linkBreadcrumb ?? [])],
      titleInNav: pageSectionTitle,
      pageSectionLevel: pageSection.pageSectionLevel,
    }
    return pageSectionResolved
  })

  if (activeMenu?.sectionTitles) {
    activeMenu.sectionTitles.forEach((sectionTitle) => {
      const pageSectionTitles = pageSections.map((h) => h.pageSectionTitle)
      assert(pageSectionTitles.includes(sectionTitle), { pageHeadingTitles: pageSectionTitles, sectionTitle })
    })
  }

  return pageSectionsResolved
}

function getHeadingsResolved(config: { menusMain: MenuDefinition[]; menusDetached: MenuDetachedDefinition[] }): {
  menusMainResolved: MenuResolved[]
  menusDetachedResolved: MenuDetachedResolved[]
} {
  const menusMainWithoutBreadcrumb: Omit<MenuResolved, 'linkBreadcrumb'>[] = config.menusMain.map(
    (menu: MenuDefinition) => {
      const titleInNav = menu.titleInNav || menu.title
      const menuMainResolved: Omit<MenuResolved, 'linkBreadcrumb'> = {
        ...menu,
        titleInNav,
      }
      return menuMainResolved
    },
  )

  const menusMainResolved: MenuResolved[] = []
  menusMainWithoutBreadcrumb.forEach((menu) => {
    const linkBreadcrumb = getHeadingsBreadcrumb(menu, menusMainResolved)
    menusMainResolved.push({
      ...menu,
      linkBreadcrumb,
    })
  })

  const menusDetachedResolved = config.menusDetached.map((menuDetached) => {
    const { url } = menuDetached
    assert(
      menusMainResolved.find((menu) => menu.url === url) === undefined,
      `remove ${menuDetached.url} from menusDetached`,
    )
    return {
      ...menuDetached,
      level: 2 as const,
      titleInNav: menuDetached.title,
      linkBreadcrumb: null,
    }
  })

  return { menusMainResolved, menusDetachedResolved }
}

function getHeadingsBreadcrumb(menu: Omit<MenuResolved, 'linkBreadcrumb'>, menus: MenuResolved[]) {
  const linkBreadcrumb: string[] = []
  let levelCurrent = menu.level
  menus
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

function assertHeadingsDefinition(menus: { url?: null | string }[]) {
  menus.forEach((menu) => {
    if (menu.url) {
      const { url } = menu
      assert(url.startsWith('/'))
    }
  })
}
