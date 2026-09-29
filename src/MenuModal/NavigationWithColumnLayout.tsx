export { NavigationWithColumnLayout }
export { menuPaddingX }

import React, { useEffect, useState } from 'react'
import { assert } from '../utils/server.js'
import { getViewportWidth } from '../utils/getViewportWidth.js'
import { viewTablet, navLeftWidthMax, navLeftWidthMin, bodyMaxWidth } from '../Layout.js'
import { throttle } from '../utils/throttle.js'
import { Collapsible } from './Collapsible.js'
import { ColumnMap, getNavItemsWithComputed, NavItem, NavItemComponent, NavItemComputed } from '../NavItemComponent.js'
import { usePageContext } from '../renderer/usePageContext.js'
import './NavigationWithColumnLayout.css'
import { Style } from '../utils/Style.js'
import { css } from '../utils/css.js'

const marginBottomOnExpand = 15
// Desktop: the menu is a panel sized to its columns (MenuModal.tsx)
const menuColumnWidth = 240
const menuColumnGap = 40
const menuPaddingX = 28
const getMenuWidth = (numberOfColumns: number) =>
  numberOfColumns * menuColumnWidth + (numberOfColumns - 1) * menuColumnGap + 2 * menuPaddingX
function NavigationWithColumnLayout(props: { navItems: NavItem[] }) {
  const pageContext = usePageContext()
  const navItemsWithComputed = getNavItemsWithComputed(props.navItems, pageContext.urlPathname)
  let [viewportWidth, setViewportWidth] = useState<number | undefined>()
  const updateviewportwidth = () => setViewportWidth(getViewportWidth())
  useEffect(() => {
    updateviewportwidth()
    window.addEventListener('resize', throttle(updateviewportwidth, 300), { passive: true })
  })
  const availableWidth = viewportWidth && Math.min(viewportWidth, bodyMaxWidth)
  const navItemsByColumnLayouts = getNavItemsByColumnLayouts(navItemsWithComputed, availableWidth)
  const columnWidthBase = navLeftWidthMax + 20
  const maxColumns = Math.max(...navItemsByColumnLayouts.map((layout) => layout.columns.length), 1)
  const widthMax = maxColumns * columnWidthBase
  const columnsWrapperStyle = { maxWidth: `min(100%, ${widthMax}px)` }
  return (
    <>
      <Style>{getStyle()}</Style>
      <div
        id="menu-navigation-container"
        className="navigation-content add-transition"
        style={{ transitionProperty: 'height', height: 0 }}
      >
        {navItemsByColumnLayouts.map((columnLayout, i) => (
          <div
            id={`menu-navigation-${i}`}
            className="menu-navigation-content"
            style={{ transition: 'none 0.2s var(--dp-ease-out)', transitionProperty: 'opacity, transform, visibility' }}
            key={i}
          >
            {columnLayout.isFullWidthCategory ? (
              <div style={{ marginTop: 0 }}>
                <ColumnsWrapper style={columnsWrapperStyle}>
                  <Collapsible
                    head={<NavItemComponent navItem={columnLayout.navItemLevel1} />}
                    disabled={maxColumns > 1}
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
              <ColumnsWrapper style={columnsWrapperStyle}>
                <ColumnsLayout>
                  {columnLayout.columns.map((column, j) => (
                    <Column key={j}>
                      {column.categories.map((category, k) => (
                        <div key={k} style={{ marginBottom: 0 }}>
                          <Collapsible
                            head={<NavItemComponent navItem={category.navItemLevel1} />}
                            disabled={maxColumns > 1}
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
@media (width > ${viewTablet}px) {
  .menu-navigation-content {
    position: absolute;
    width: 100%;
  }
  ${/* Columns of a fixed width, evenly spaced: the panel is sized to them (--menu-width, see MenuModal.tsx) */ ''}
  ${navItemsByColumnLayouts
    .map(
      (columnLayout, i) => css`
  html.menu-modal-show-${i} #menu-modal-wrapper {
    --menu-width: min(${getMenuWidth(columnLayout.columns.length)}px, 100% - 32px);
  }`,
    )
    .join('')}
  .columns-wrapper {
    width: auto !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 0 !important;
  }
  .menu-columns {
    justify-content: flex-start !important;
    gap: ${menuColumnGap}px;
  }
  .menu-column {
    flex: 0 1 ${menuColumnWidth}px !important;
    min-width: 0;
    max-width: none !important;
  }
  #menu-navigation-container {
    position: relative;
    overflow: hidden;
  }
 ${navItemsByColumnLayouts
   .map((_, i) => {
     const isFirst = i === 0
     const isLast = i === navItemsByColumnLayouts.length - 1
     return css`
#menu-navigation-${i} {
  ${/* Fading animation */ ''}
  html:not(.menu-modal-show-${i}) & {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }
  ${/* Sliding animation */ ''}
  html:not(.menu-modal-show-${i}).menu-modal-show & {
    ${!isFirst && !isLast ? '' : `transform: translate(${isFirst ? '-' : ''}50px, 0);`}
  }
  ${/* Performance optimization. */ ''}
  ${/* - Using clip-path transition instead of height transition doesn't make a difference: https://github.com/brillout/docpress/commit/005cba0b4cba9c1b526e8e26901ee04129d79715 */ ''}
  ${/* - Suprisingly, this is a performance regression when transitioning from one menu to another (the menu is kept open). Thus we apply this only when the menu is being closed/opened. */ ''}
  html:not(.menu-modal-show-${i}).menu-modal-display-only-one & {
    display: none;
  }
}
${/* Button style */ ''}
.menu-toggle-${i} {
  html.menu-modal-show.menu-modal-show-${i} & {
    color: var(--dp-color-text) !important;
    [class^='decolorize-'],
    [class*=' decolorize-'] {
      filter: grayscale(0) opacity(1) !important;
    }
    &::before {
      top: 0;
    }
    & .caret-icon-left {
      transform: rotate(-90deg);
    }
    & .caret-icon-right {
      transform: rotate(90deg);
    }
  }
}
`
   })
   .join('')}
}
`
    return style
  }
}
function Column({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="menu-column"
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
function ColumnsWrapper({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="columns-wrapper"
      style={{
        paddingLeft: 3,
        margin: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
function ColumnsLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={['menu-columns', className].filter(Boolean).join(' ')}
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
function getNavItemsByColumnLayouts(navItems: NavItemComputed[], availableWidth: number = 0): NavItemsByColumnLayout[] {
  const navItemsByColumnEntries = getNavItemsByColumnEntries(navItems)
  const numberOfColumnsMax = Math.floor(availableWidth / navLeftWidthMin) || 1
  const navItemsByColumnLayouts: NavItemsByColumnLayout[] = navItemsByColumnEntries.map(
    ({ columnEntries, isFullWidthCategory }) => {
      const numberOfColumns = getBalancedNumberOfColumns(
        columnEntries,
        Math.min(numberOfColumnsMax, columnEntries.length),
      )
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
          const navItemLevel1 = columnEntry.navItems[0]!
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
            navItemLevel1 = navItems[0]!
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
// The fewest columns that are as short as the most columns: e.g. a two-item column next to a long one is merged with a
// neighbor (the columns balance, and the menu is narrower), unless that makes the menu taller
function getBalancedNumberOfColumns(columnEntries: ColumnEntry[], numberOfColumnsMax: number): number {
  // The rendered heights (px) of a category's title, a group label and an item; the current page's sections (level 3)
  // are left out: the layout doesn't change from one page to another
  const rowHeights: Record<number, number> = { 1: 43, 4: 40, 2: 31, 3: 0 }
  const gapBetweenEntries = 26
  const getEntryHeight = (columnEntry: ColumnEntry) =>
    columnEntry.navItems.reduce((height, navItem) => height + (rowHeights[navItem.level] ?? 0), 0)
  const getHeight = (numberOfColumns: number) => {
    const columnHeights: number[] = []
    columnEntries.forEach((columnEntry) => {
      const idx = numberOfColumns === 1 ? 0 : columnEntry.columnMap[numberOfColumns]!
      const height = columnHeights[idx]
      columnHeights[idx] =
        height === undefined ? getEntryHeight(columnEntry) : height + gapBetweenEntries + getEntryHeight(columnEntry)
    })
    return Math.max(0, ...columnHeights.map((height) => height ?? 0))
  }
  const heights = Array.from({ length: numberOfColumnsMax }, (_, i) => getHeight(i + 1))
  const heightMin = Math.min(...heights)
  return heights.findIndex((height) => height <= heightMin) + 1
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
      if (isFullWidthCategory) {
        assert(navItem.menuModalFullWidth)
      }
      const isFullWidthCategoryPrevious = !!isFullWidthCategory
      if (navItem.menuModalFullWidth) {
        isFullWidthCategory = true
        // Flush
        navItemsByColumnEntries.push({ columnEntries, isFullWidthCategory: isFullWidthCategoryPrevious })
        columnEntries = []
      } else {
        isFullWidthCategory = false
      }
    }
    assert(isFullWidthCategory !== undefined)
    if (navItem.isPotentialColumn) {
      assert(navItem.level === 1 || navItem.level === 4)
      columnEntry = { navItems: [navItem], columnMap: navItem.isPotentialColumn }
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
