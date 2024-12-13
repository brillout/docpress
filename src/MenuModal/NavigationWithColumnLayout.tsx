export { NavigationWithColumnLayout }

import React, { useEffect, useState } from 'react'
import { assert } from '../utils/server'
import { getViewportWidth } from '../utils/getViewportWidth'
import { containerQueryMobileMenu, navLeftWidthMax, navLeftWidthMin } from '../Layout'
import { throttle } from '../utils/throttle'
import { Collapsible } from './Collapsible'
import { ColumnMap, getNavItemsWithComputed, NavItem, NavItemComponent, NavItemComputed } from '../NavItemComponent'
import { usePageContext } from '../renderer/usePageContext'
import './NavigationWithColumnLayout.css'
import { Style } from '../utils/Style'
import { css } from '../utils/css'

const marginBottomOnExpand = 30
function NavigationWithColumnLayout(props: { navItems: NavItem[] }) {
  const pageContext = usePageContext()
  const navItemsWithComputed = getNavItemsWithComputed(props.navItems, pageContext.urlPathname)
  let [viewportWidth, setViewportWidth] = useState<number | undefined>()
  const updateviewportwidth = () => setViewportWidth(getViewportWidth())
  useEffect(() => {
    updateviewportwidth()
    window.addEventListener('resize', throttle(updateviewportwidth, 300), { passive: true })
  })
  const navItemsByColumnLayouts = getNavItemsByColumnLayouts(navItemsWithComputed, viewportWidth)
  return (
    <>
      <Style>{getStyle()}</Style>
      <div
        id="menu-navigation-container"
        className="navigation-content"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {navItemsByColumnLayouts.map((columnLayout, i) => (
          <div
            id={`menu-navigation-${i}`}
            style={{
              paddingTop: 10,
              position: 'absolute',
              width: '100%',
            }}
            key={i}
          >
            {columnLayout.isFullWidthCategory ? (
              <div style={{ marginTop: 0 }}>
                <ColumnsWrapper numberOfColumns={columnLayout.columns.length}>
                  <Collapsible
                    head={(onClick) => <NavItemComponent navItem={columnLayout.navItemLevel1} onClick={onClick} />}
                    disabled={columnLayout.columns.length > 1}
                    collapsedInit={!columnLayout.navItemLevel1.isRelevant}
                    marginBottomOnExpand={marginBottomOnExpand}
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
                            marginBottomOnExpand={marginBottomOnExpand}
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
      </div>
    </>
  )

  function getStyle() {
    const style = css`
@media(min-width: ${containerQueryMobileMenu + 1}px) {
 ${navItemsByColumnLayouts
   .map(
     (_, i) =>
       css`
html:not(.menu-modal-show-${i}) #menu-navigation-${i} {
  opacity: 0;
  pointer-events: none;
}
html.menu-modal-show.menu-modal-show-${i} {
  .menu-toggle-${i} {
    color: black !important;
    cursor: default !important;
    [class^='decolorize-'],
    [class*=' decolorize-'] {
      filter: grayscale(0) opacity(1) !important;
    }
    &::before {
      top: 0;
    }
  }
}
`,
   )
   .join('')}
}
`
    return style
  }
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
