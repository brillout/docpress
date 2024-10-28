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
import '../global.d.ts'

type NavItem = {
  level: number
  url?: string | null
  color?: string
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
            <div
              className={`column-layout-${i}` + (!isFullWidth ? '' : ' nav-category')}
              style={{
                flexGrow: 1,
                columnGap: 20,
                paddingBottom: isFullWidth ? paddingBottom : undefined,
              }}
            >
              <CategoryBorder
                navItemLevel1={!isFullWidth ? undefined : navItemsColumnEntries[0]!}
                paddingBottom={paddingBottom}
              />
              {navItemsColumnEntries.map((navItemColumnEntry, j) => (
                <div
                  key={j}
                  className={'column-layout-entry' + (isFullWidth ? '' : ' nav-category')}
                  style={{
                    breakInside: 'avoid',
                    paddingBottom: !isFullWidth ? paddingBottom : undefined,
                    width: '100%',
                  }}
                >
                  <CategoryBorder
                    navItemLevel1={isFullWidth ? undefined : navItemColumnEntry!}
                    paddingBottom={paddingBottom}
                  />
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
function CategoryBorder({ navItemLevel1, paddingBottom }: { navItemLevel1?: NavItemComputed; paddingBottom: number }) {
  return !navItemLevel1 ? null : (
    <div
      className={'category-border' + ((navItemLevel1.isRelevant && ' is-relevant') || '')}
      style={{
        width: 6,
        background: navItemLevel1.color!,
        height: `calc(100% - ${paddingBottom}px - 13px)`,
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
      navItem.isRelevant && 'is-relevant',
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

type NavItemsColumnEntry = NavItemComputed & { navItemChilds: NavItemComputed[] }
function groupByColumnLayout(navItems: NavItemComputed[]) {
  const navItemsColumnLayout: { navItemsColumnEntries: NavItemsColumnEntry[]; isFullWidth: boolean }[] = []
  let navItemsColumnEntries: NavItemsColumnEntry[] = []
  let isFullWidth: boolean | undefined
  navItems.forEach((navItem) => {
    if (navItem.level === 1) {
      const isFullWidthPrevious = isFullWidth
      isFullWidth = !!navItem.menuModalFullWidth
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
