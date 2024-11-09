// TODO/refactor: rename file and/or component
export { NavigationContent }
// TODO/refactor: do this only on the server side?
export type { NavItem }

import React, { useEffect, useState } from 'react'
import { assert, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { parseTitle } from '../parseTitle'
import { usePageContext } from '../renderer/usePageContext'
import '@docsearch/css'
import '../global.d.ts'
import { getViewportWidth } from '../utils/getViewportWidth'
import { navLeftWidthMax, navLeftWidthMin } from '../Layout'
import { throttle } from '../utils/throttle'
import { Collapsible } from './Collapsible'

type NavItem = {
  level: number
  url?: string | null
  color?: string
  title: string
  titleInNav: string
  menuModalFullWidth?: true
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
    let navItemsRelevant = navItemsWithComputed
    if (props.showOnlyRelevant) navItemsRelevant = navItemsRelevant.filter((navItemGroup) => navItemGroup.isRelevant)
    navContent = navItemsRelevant.map((navItem, i) => <NavItemComponent navItem={navItem} key={i} />)
  } else {
    assert(!props.showOnlyRelevant)
    navContent = <NavigationWithColumnLayout navItemsWithComputed={navItemsWithComputed} />
  }

  return (
    <div className="navigation-content" style={{ marginTop: 10 }}>
      {navContent}
    </div>
  )
}

function NavigationWithColumnLayout(props: { navItemsWithComputed: NavItemComputed[] }) {
  let [viewportWidth, setViewportWidth] = useState<number | undefined>()
  const updateviewportwidth = () => setViewportWidth(getViewportWidth())
  useEffect(() => {
    updateviewportwidth()
    window.addEventListener('resize', throttle(updateviewportwidth, 300), { passive: true })
  })
  const navItemsByColumnLayouts = getNavItemsByColumnLayouts(props.navItemsWithComputed, viewportWidth)
  return (
    <>
      {navItemsByColumnLayouts.map((columnLayout, i) => (
        <div key={i}>
          {columnLayout.isFullWidthCategory ? (
            <div style={{ marginTop: 0 }}>
              <ColumnsWrapper numberOfColumns={columnLayout.columns.length}>
                <Collapsible
                  head={(onClick) => <NavItemComponent navItem={columnLayout.navItemLevel1} onClick={onClick} />}
                  disabled={columnLayout.columns.length > 1}
                  collapsedInit={!columnLayout.navItemLevel1.isRelevant}
                  marginBottomOnExpand={10}
                >
                  <ColumnsLayout className="collapsible">
                    {columnLayout.columns.map((column, j) => (
                      <Column key={j}>
                        {column.navItems.map((navItem, k) => (
                          <NavItemComponent key={k} navItem={navItem} />
                        ))}
                      </Column>
                    ))}
                    <CategoryBorder navItemLevel1={columnLayout.navItemLevel1} />
                  </ColumnsLayout>
                </Collapsible>
              </ColumnsWrapper>
            </div>
          ) : (
            <ColumnsWrapper numberOfColumns={columnLayout.columns.length}>
              <ColumnsLayout>
                {columnLayout.columns.map((column, j) => (
                  <Column key={j}>
                    {column.categories.map((category, k) => (
                      <div key={k} style={{ marginBottom: 0 }}>
                        <Collapsible
                          head={(onClick) => <NavItemComponent navItem={category.navItemLevel1} onClick={onClick} />}
                          disabled={columnLayout.columns.length > 1}
                          collapsedInit={!category.navItemLevel1.isRelevant}
                          marginBottomOnExpand={40}
                        >
                          {category.navItems.map((navItem, l) => (
                            <NavItemComponent key={l} navItem={navItem} />
                          ))}
                          <CategoryBorder navItemLevel1={category.navItemLevel1} />
                        </Collapsible>
                      </div>
                    ))}
                  </Column>
                ))}
              </ColumnsLayout>
            </ColumnsWrapper>
          )}
        </div>
      ))}
    </>
  )
}
function Column({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flexGrow: 1,
        maxWidth: navLeftWidthMax,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}
function ColumnsWrapper({ children, numberOfColumns }: { children: React.ReactNode; numberOfColumns: number }) {
  return (
    <div
      style={{
        width: numberOfColumns * (navLeftWidthMax + 20),
        maxWidth: '100%',
        margin: 'auto',
      }}
    >
      {children}
    </div>
  )
}
function ColumnsLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {children}
    </div>
  )
}
function CategoryBorder({ navItemLevel1 }: { navItemLevel1: NavItemComputed }) {
  assert(navItemLevel1.level === 1)
  return <div className="category-border" style={{ background: navItemLevel1.color! }} />
}

type PropsNavItem = PropsAnchor & PropsSpan
type PropsAnchor = React.HTMLProps<HTMLAnchorElement>
type PropsSpan = React.HTMLProps<HTMLSpanElement>
function NavItemComponent({
  navItem,
  onClick,
}: {
  navItem: NavItemComputed
  onClick?: PropsNavItem['onClick']
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

  let children: JSX.Element = titleInNavJsx
  if (navItem.level === 1) {
    children = (
      <>
        {children}
        <Chevron className="collapsible-icon" height={8} />
      </>
    )
  }

  const props: PropsNavItem = {
    href: navItem.url ?? undefined,
    children,
    onClick,
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

  if (navItem.level === 2 || navItem.level === 3) {
    return <a {...props} />
  } else {
    return <span {...props} />
  }
}

type NavItemsByColumnLayout =
  | {
      columns: {
        categories: {
          navItemLevel1: NavItemComputed
          navItems: NavItemComputed[]
        }[]
      }[]
      isFullWidthCategory: false
    }
  | {
      navItemLevel1: NavItemComputed
      columns: { navItems: NavItemComputed[] }[]
      isFullWidthCategory: true
    }
type NavItemsByColumnLayout2 = { columns: NavItemComputed[][][]; isFullWidthCategory: boolean }
function getNavItemsByColumnLayouts(navItems: NavItemComputed[], viewportWidth: number = 0): NavItemsByColumnLayout[] {
  const navItemsByColumnEntries = getNavItemsByColumnEntries(navItems)
  const numberOfColumnsMax = Math.floor(viewportWidth / navLeftWidthMin) || 1
  const navItemsByColumnLayouts: NavItemsByColumnLayout[] = navItemsByColumnEntries.map(
    ({ columnEntries, isFullWidthCategory }) => {
      const numberOfColumns = Math.min(numberOfColumnsMax, columnEntries.length)
      if (!isFullWidthCategory) {
        const columns: {
          categories: {
            navItemLevel1: NavItemComputed
            navItems: NavItemComputed[]
          }[]
        }[] = []
        columnEntries.forEach((columnEntry) => {
          const idx = numberOfColumns === 1 ? 0 : columnEntry.columnMap[numberOfColumns]!
          assert(idx >= 0)
          columns[idx] ??= { categories: [] }
          const navItemLevel1 = columnEntry.navItems[0]
          const navItems = columnEntry.navItems.slice(1)
          columns[idx].categories.push({ navItemLevel1, navItems })
        })
        const navItemsByColumnLayout: NavItemsByColumnLayout = { columns, isFullWidthCategory }
        return navItemsByColumnLayout
      } else {
        let navItemLevel1: NavItemComputed
        const columns: { navItems: NavItemComputed[] }[] = []
        columnEntries.forEach((columnEntry, i) => {
          const idx = numberOfColumns === 1 ? 0 : columnEntry.columnMap[numberOfColumns]!
          assert(idx >= 0)
          columns[idx] ??= { navItems: [] }
          let { navItems } = columnEntry
          if (i === 0) {
            navItemLevel1 = navItems[0]
            navItems = navItems.slice(1)
          }
          columns[idx].navItems.push(...navItems)
        })
        const navItemsByColumnLayout: NavItemsByColumnLayout = {
          columns,
          navItemLevel1: navItemLevel1!,
          isFullWidthCategory,
        }
        return navItemsByColumnLayout
      }
    },
  )
  return navItemsByColumnLayouts
}
type NavItemsByColumnEntries = { columnEntries: ColumnEntry[]; isFullWidthCategory: boolean }[]
type ColumnEntry = { navItems: NavItemComputed[]; columnMap: ColumnMap }
type ColumnMap = Record<number, number>
function getNavItemsByColumnEntries(navItems: NavItemComputed[]): NavItemsByColumnEntries {
  const navItemsByColumnEntries: NavItemsByColumnEntries = []
  let columnEntries: ColumnEntry[] = []
  let columnEntry: ColumnEntry
  let isFullWidthCategory: boolean | undefined
  navItems.forEach((navItem) => {
    if (navItem.level === 1) {
      const isFullWidthCategoryPrevious = isFullWidthCategory
      isFullWidthCategory = !!navItem.menuModalFullWidth
      if (isFullWidthCategoryPrevious !== undefined && isFullWidthCategoryPrevious !== isFullWidthCategory) {
        navItemsByColumnEntries.push({ columnEntries, isFullWidthCategory: isFullWidthCategoryPrevious })
        columnEntries = []
      }
    }
    assert(isFullWidthCategory !== undefined)
    if (navItem.isColumnEntry) {
      assert(navItem.level === 1 || navItem.level === 4)
      columnEntry = { navItems: [navItem], columnMap: navItem.isColumnEntry }
      columnEntries.push(columnEntry)
    } else {
      assert(navItem.level !== 1)
      columnEntry.navItems.push(navItem)
    }
  })
  assert(isFullWidthCategory !== undefined)
  navItemsByColumnEntries.push({ columnEntries, isFullWidthCategory })
  return navItemsByColumnEntries
}

type NavItemComputed = ReturnType<typeof getNavItemsWithComputed>[number]
function getNavItemsWithComputed(navItems: NavItem[], currentUrl: string) {
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

function Chevron(props: React.HTMLProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 292.52" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="#aaa"
        d="M10.725 42.42L230.125 291.82c6.8 6.8 16.2 10.7 25.9 10.7s19.1-3.9 25.9-10.7l219.4-249.4c14.3-14.3 14.3-37.4 0-51.7s-37.4-14.3-51.7 0l-193.6 223.6-193.6-223.6c-14.3-14.3-37.4-14.3-51.7 0s-14.3 37.5 0 51.7z"
      />
    </svg>
  )
}
