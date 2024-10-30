// TODO/refactor: rename file and/or component
export { NavigationContent }
// TODO/refactor: do this only on the server side?
export type { NavItem }
export type { NavItemAll }

import React, { useEffect, useState } from 'react'
import { assert, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { parseTitle } from '../parseTitle'
import { usePageContext } from '../renderer/usePageContext'
import '@docsearch/css'
import '../global.d.ts'
import { getViewportWidth } from '../utils/getViewportWidth'
import { navWidthMax, navWidthMin } from '../Layout'

type NavItem = {
  level: number
  url?: string | null
  color?: string
  title: string
  titleInNav: string
  menuModalFullWidth?: true
}
type NavItemAll = NavItem & {
  isColumnEntry?: ColumnMap
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
    navContent = <NavigationColumnLayout navItemsWithComputed={navItemsWithComputed} />
  }

  return (
    <div className="navigation-content" style={{ marginTop: 10 }}>
      {navContent}
    </div>
  )
}

function NavigationColumnLayout(props: { navItemsWithComputed: NavItemComputed[] }) {
  let [viewportWidth, setViewportWidth] = useState<number | undefined>()
  const updateviewportwidth = () => setViewportWidth(getViewportWidth())
  useEffect(() => {
    updateviewportwidth()
    window.addEventListener('resize', updateviewportwidth, { passive: true })
  })

  const navItemsByColumnLayouts = getNavItemsByColumnLayouts(props.navItemsWithComputed, viewportWidth)

  return (
    <>
      {navItemsByColumnLayouts.map(({ columns, isFullWidth }, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            width: columns.length * (navWidthMax + 20),
            justifyContent: 'space-between',
            maxWidth: '100%',
            margin: 'auto',
            marginBottom: 40,
          }}
        >
          {columns.map((columnEntry, j) => (
            <div
              key={j}
              style={{
                flexGrow: 1,
                maxWidth: navWidthMax,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: isFullWidth && j !== 0 ? 36 : undefined,
              }}
            >
              {columnEntry.map((navItems, k) => (
                <div key={k}>
                  {navItems.map((navItem, l) => (
                    <NavItemComponent navItem={navItem} key={l} />
                  ))}
                  <CategoryBorder navItemLevel1={isFullWidth ? undefined : navItems[0]!} />
                </div>
              ))}
            </div>
          ))}
          <CategoryBorder navItemLevel1={!isFullWidth ? undefined : columns[0][0][0]!} />
        </div>
      ))}
    </>
  )
}

function CategoryBorder({ navItemLevel1 }: { navItemLevel1?: NavItemComputed }) {
  return !navItemLevel1 ? null : (
    <div
      className="category-border"
      style={{
        background: navItemLevel1.color!,
      }}
    />
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

  const props: PropsAnchor & PropsSpan = {
    href: navItem.url ?? undefined,
    children: titleInNavJsx,
    className: [
      'nav-item',
      'nav-item-level-' + navItem.level,
      navItem.url && navItem.isActive && ' is-active',
      navItem.isFirstOfItsKind && 'nav-item-first-of-its-kind',
      navItem.isLastOfItsKind && 'nav-item-last-of-its-kind',
    ]
      .filter(Boolean)
      .join(' '),
  }
  if (navItem.level === 1) {
    props.style = {
      ['--category-color']: navItem.color!,
    }
  }
  type PropsAnchor = React.HTMLProps<HTMLAnchorElement>
  type PropsSpan = React.HTMLProps<HTMLSpanElement>

  if (navItem.level === 2 || navItem.level === 3) {
    return <a {...props} />
  } else {
    return <span {...props} />
  }
}

type NavItemsByColumnLayout = { columns: NavItemComputed[][][]; isFullWidth: boolean }
function getNavItemsByColumnLayouts(navItems: NavItemComputed[], viewportWidth: number = 0): NavItemsByColumnLayout[] {
  const navItemsByColumnEntries = getNavItemsByColumnEntries(navItems)
  const numberOfColumnsMax = Math.floor(viewportWidth / navWidthMin) || 1
  const navItemsByColumnLayouts: NavItemsByColumnLayout[] = navItemsByColumnEntries.map(
    ({ columnEntries, isFullWidth }) => {
      const numberOfColumns = Math.min(numberOfColumnsMax, columnEntries.length)
      const columns: NavItemComputed[][][] = []
      columnEntries.forEach((columnEntry) => {
        const idx = numberOfColumns === 1 ? 0 : columnEntry.columnMap[numberOfColumns]!
        assert(idx >= 0)
        columns[idx] ??= []
        columns[idx].push(columnEntry.navItems)
      })
      const navItemsByColumnLayout: NavItemsByColumnLayout = { columns, isFullWidth }
      return navItemsByColumnLayout
    },
  )
  return navItemsByColumnLayouts
}

type NavItemsByColumnEntries = { columnEntries: ColumnEntry[]; isFullWidth: boolean }[]
type ColumnEntry = { navItems: NavItemComputed[]; columnMap: ColumnMap }
type ColumnMap = Record<number, number>
function getNavItemsByColumnEntries(navItems: NavItemComputed[]): NavItemsByColumnEntries {
  const navItemsByColumnEntries: NavItemsByColumnEntries = []
  let columnEntries: ColumnEntry[] = []
  let columnEntry: ColumnEntry
  let isFullWidth: boolean | undefined
  navItems.forEach((navItem) => {
    if (navItem.level === 1) {
      const isFullWidthPrevious = isFullWidth
      isFullWidth = !!navItem.menuModalFullWidth
      if (isFullWidthPrevious !== undefined && isFullWidthPrevious !== isFullWidth) {
        navItemsByColumnEntries.push({ columnEntries, isFullWidth: isFullWidthPrevious })
        columnEntries = []
      }
    }
    assert(isFullWidth !== undefined)
    if (navItem.isColumnEntry) {
      assert(navItem.level === 1 || navItem.level === 4)
      columnEntry = { navItems: [navItem], columnMap: navItem.isColumnEntry }
      columnEntries.push(columnEntry)
    } else {
      assert(navItem.level !== 1)
      columnEntry.navItems.push(navItem)
    }
  })
  assert(isFullWidth !== undefined)
  navItemsByColumnEntries.push({ columnEntries, isFullWidth })
  return navItemsByColumnEntries
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
