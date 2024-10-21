// TODO/refactor: rename file and/or component
export { NavigationContent }
// TODO/refactor: do this only on the server side?
export { groupByLevelMin }
export type { NavItem }

import React from 'react'
import { assert, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { parseTitle } from '../parseTitle'
import { usePageContext } from '../renderer/usePageContext'
import '@docsearch/css'

type NavItem = {
  level: number
  url?: string | null
  title: string
  titleInNav: string
}
type NavItemComputed = NavItem & {
  isActive: boolean
  isActiveFirst: boolean
  isActiveLast: boolean
  isFirstOfItsKind: boolean
  isLastOfItsKind: boolean
}

function NavigationContent(props: {
  navItems: NavItem[]
  style?: React.CSSProperties
  styleGroups?: React.CSSProperties
}) {
  const pageContext = usePageContext()
  const navItemsWithComputed = addComputedProps(props.navItems, pageContext.urlPathname)
  const navItemsGrouped = groupByLevelMin(navItemsWithComputed)

  return (
    <div id="navigation-content" style={{ marginTop: 20, ...props.style }}>
      {navItemsGrouped.map((navItemGroup, i) => (
        <div className="nav-items-group" key={i} style={props.styleGroups}>
          <NavItemComponent navItem={navItemGroup} />
          {navItemGroup.navItemChilds.map((navItem, j) => (
            <NavItemComponent navItem={navItem} key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}

function NavItemComponent({
  navItem,
}: {
  navItem: NavItemComputed
}) {
  assert([1, 2, 3, 4].includes(navItem.level), navItem)
  const titleJsx = parseTitle(navItem.title)
  const titleInNavJsx = parseTitle(navItem.titleInNav)
  if (navItem.level === 1 || navItem.level === 4) {
    assert(navItem.url === undefined)
  } else {
    const sectionTitle = jsxToTextContent(titleJsx)
    assertWarning(
      navItem.url,
      [
        `${jsxToTextContent(titleInNavJsx)} is missing a URL hash.`,
        `Add a URL hash with: \`## ${sectionTitle}{#some-hash}\`.`,
        /* TODO/eventually: not implemented yet.
        `Use \`<h2 id="url-hash">${sectionTitle}</h2>\` instead of \`## ${sectionTitle}\`.`,
        */
      ].join(' '),
    )
  }
  return (
    <a
      className={[
        'nav-item',
        'nav-item-level-' + navItem.level,
        navItem.url && navItem.isActive && ' is-active',
        navItem.url && navItem.isActiveFirst && ' is-active-first',
        navItem.url && navItem.isActiveLast && ' is-active-last',
        navItem.isFirstOfItsKind && 'nav-item-first-of-its-kind',
        navItem.isLastOfItsKind && 'nav-item-last-of-its-kind',
      ]
        .filter(Boolean)
        .join(' ')}
      href={navItem.url ?? undefined}
    >
      {/* <span className="nav-item-text">{titleInNavJsx}</span> */}
      {titleInNavJsx}
    </a>
  )
}

function groupByLevelMin<T extends NavItem>(navItems: T[]) {
  const navItemsGrouped: (T & { navItemChilds: T[] })[] = []
  const levelMin: number = Math.min(...navItems.map((h) => h.level))
  navItems.forEach((navItem) => {
    if (navItem.level === levelMin) {
      navItemsGrouped.push({ ...navItem, navItemChilds: [] })
    } else {
      navItemsGrouped[navItemsGrouped.length - 1].navItemChilds.push(navItem)
    }
  })
  return navItemsGrouped
}

function addComputedProps(navItems: NavItem[], currentUrl: string): NavItemComputed[] {
  return navItems.map((navItem, i) => {
    assert([1, 2, 3, 4].includes(navItem.level), navItem)

    const navItemPrevious = navItems[i - 1]
    const navItemNext = navItems[i + 1]

    let isActiveFirst = false
    let isActiveLast = false
    let isActive = false
    if (navItem.url === currentUrl) {
      assert(navItem.level === 2, { currentUrl })
      isActive = true
      isActiveFirst = true
      if (navItemNext?.level !== 3) {
        isActiveLast = true
      }
    }
    if (navItem.level === 3) {
      isActive = true
      if (navItemNext?.level !== 3) {
        isActiveLast = true
      }
    }

    const isFirstOfItsKind = navItem.level !== navItemPrevious?.level
    const isLastOfItsKind = navItem.level !== navItemNext?.level

    return {
      ...navItem,
      isActive,
      isActiveFirst,
      isActiveLast,
      isFirstOfItsKind,
      isLastOfItsKind,
    }
  })
}
