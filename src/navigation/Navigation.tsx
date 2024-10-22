// TODO/refactor: rename file and/or component
export { NavigationContent }
// TODO/refactor: do this only on the server side?
export type { NavItem }
export type { NavItemAll }

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
  menuModalFullWidth?: true
}
type NavItemAll = NavItem & {
  isColumnLayoutElement?: true
}
function NavigationContent(props: {
  navItems: NavItem[]
  showOnlyRelevant?: true
  columnLayout?: true
}) {
  const pageContext = usePageContext()
  const navItemsWithComputed = getNavItemsWithComputed(props.navItems, pageContext.urlPathname)

  let navContent: React.ReactNode
  if (!props.columnLayout) {
    navContent = navItemsWithComputed
      .filter((navItemGroup) => !props.showOnlyRelevant || navItemGroup.isRelevant)
      .map((navItem, i) => <NavItemComponent navItem={navItem} key={i} />)
  } else {
    assert(!props.showOnlyRelevant)
    const navItemsColumnLayout = groupByColumnLayout(navItemsWithComputed)
    const paddingBottom = 40
    navContent = (
      <>
        {navItemsColumnLayout.map(({ navItemsColumnEntries, isFullWidth }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {isFullWidth && <NavItemComponent navItem={isFullWidth} />}
            <div
              className={`column-layout-${i}`}
              style={{
                flexGrow: 1,
                columnGap: 20,
                paddingBottom: isFullWidth ? paddingBottom : undefined,
              }}
            >
              {navItemsColumnEntries.map((navItemColumnEntry, j) => (
                <div
                  key={j}
                  className="column-layout-entry"
                  style={{
                    breakInside: 'avoid',
                    paddingBottom: !isFullWidth ? paddingBottom : undefined,
                    width: '100%',
                  }}
                >
                  <NavItemComponent navItem={navItemColumnEntry} />
                  {navItemColumnEntry.navItemChilds.map((navItem, k) => (
                    <NavItemComponent navItem={navItem} key={k} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="navigation-content" style={{ marginTop: 10 }}>
      {navContent}
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

type NavItemsColumnEntry = NavItemComputed & { navItemChilds: NavItemComputed[] }
function groupByColumnLayout(navItems: NavItemComputed[]) {
  const navItemsColumnLayout: { navItemsColumnEntries: NavItemsColumnEntry[]; isFullWidth: false | NavItemComputed }[] =
    []
  let navItemsColumnEntries: NavItemsColumnEntry[] = []
  let isFullWidth: false | NavItemComputed | undefined
  navItems.forEach((navItem) => {
    if (navItem.level === 1) {
      const isFullWidthPrevious = isFullWidth
      isFullWidth = !navItem.menuModalFullWidth ? false : navItem
      if (isFullWidthPrevious !== undefined && isFullWidthPrevious !== isFullWidth) {
        navItemsColumnLayout.push({ navItemsColumnEntries, isFullWidth: isFullWidthPrevious })
        navItemsColumnEntries = []
      }
    }
    assert(isFullWidth !== undefined)
    if (navItem.isColumnLayoutElement) {
      assert(navItem.level === 1 || navItem.level === 4)
      const navItemColumnEntry = { ...navItem, navItemChilds: [] }
      navItemsColumnEntries.push(navItemColumnEntry)
    } else {
      assert(navItem.level !== 1)
      navItemsColumnEntries[navItemsColumnEntries.length - 1].navItemChilds.push(navItem)
    }
  })
  assert(isFullWidth !== undefined)
  navItemsColumnLayout.push({ navItemsColumnEntries, isFullWidth })
  return navItemsColumnLayout
}

type NavItemComputed = ReturnType<typeof getNavItemsWithComputed>[number]
function getNavItemsWithComputed(navItems: NavItemAll[], currentUrl: string) {
  let navItemIdx: number | undefined
  const navItemsWithComputed = navItems.map((navItem, i) => {
    assert([1, 2, 3, 4].includes(navItem.level), navItem)

    const navItemPrevious = navItems[i - 1]
    const navItemNext = navItems[i + 1]

    let isActive = false
    if (navItem.url === currentUrl) {
      assert(navItem.level === 2, { currentUrl })
      assert(navItemIdx === undefined)
      navItemIdx = i
      isActive = true
    }

    const isFirstOfItsKind = navItem.level !== navItemPrevious?.level
    const isLastOfItsKind = navItem.level !== navItemNext?.level

    const navItemComputed = {
      ...navItem,
      isActive,
      isRelevant: false,
      isFirstOfItsKind,
      isLastOfItsKind,
    }

    return navItemComputed
  })

  // Set `isRelevant`
  if (navItemIdx !== undefined) {
    for (let i = navItemIdx; i >= 0; i--) {
      const navItem = navItemsWithComputed[i]!
      navItem.isRelevant = true
      if (navItem.level === 1) break
    }
    for (let i = navItemIdx; i < navItemsWithComputed.length; i++) {
      const navItem = navItemsWithComputed[i]!
      if (navItem.level === 1) break
      navItem.isRelevant = true
    }
  }

  return navItemsWithComputed
}
