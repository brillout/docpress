export { NavItemComponent }
export { getNavItemsWithComputed }
export type { NavItem }
export type { NavItemComputed }
export type { ColumnMap }

import React from 'react'
import { assert, assertWarning, jsxToTextContent } from './utils/server'
import './NavItemComponent.css'
import { parseMarkdownMini } from './parseMarkdownMini'

/*
// We cannot do that: we must use `import type` otherwise Vite will transpile global.d.ts and throw:
//  ```console
//  [11:55:47.528][/docs/.test-dev.test.ts][pnpm run dev][stderr] 11:55:47 AM [vite] Failed to transpile /home/runner/work/telefunc/telefunc/node_modules/.pnpm/@brillout+docpress@0.15.7_@algolia+client-search@5.31.0_@types+react@19.1.8_@vitejs+plugin-re_lcm3fspejcg3ebrmr3gvb5i3se/node_modules/@brillout/docpress/global.d.ts because:
//  x `declare` modifier not allowed for code already in an ambient context
//  ```
import './global.d.ts'
/*/
// The only purpose of `FakeExport` is to be able to use `import type`
import type { FakeExport } from './global.d.ts'
//*/

type NavItemComputed = ReturnType<typeof getNavItemsWithComputed>[number]
type NavItem = {
  level: number
  url?: string | null
  color?: string
  titleIcon?: string
  titleIconStyle?: React.CSSProperties
  title: string
  titleInNav: string
  menuModalFullWidth?: true
  // TODO: rename isColumnEntry isPotentialColumn
  /**
   * Maps viewport column counts to column indices.
   * Indicates this nav item is a "column entry" (a level-1 or level-4 heading that starts a new column section).
   * Example: `{ 1: 0, 2: 1, 3: 0 }` means:
   * - When there's 1 column, put this item in column 0
   * - When there are 2 columns, put it in column 1
   * - When there are 3 columns, put it in column 0
   */
  isColumnEntry?: ColumnMap
}
/**
 * A mapping of viewport column counts to column indices.
 * Used to determine which column a nav item should be placed in for different viewport widths.
 * Key: number of columns in the viewport
 * Value: the column index (0-based) where this item should be placed
 */
type ColumnMap = Record<number, number>

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

  const titleJsx = parseMarkdownMini(navItem.title)
  const titleInNavJsx = parseMarkdownMini(navItem.titleInNav)

  const iconSize = 25
  const icon = navItem.titleIcon && (
    <img
      src={navItem.titleIcon}
      style={{ height: iconSize, width: iconSize, marginRight: 8, marginLeft: 4, ...navItem.titleIconStyle }}
    />
  )

  if (navItem.level === 1 || navItem.level === 4) {
    assert(navItem.url === undefined)
  } else {
    const sectionTitle = jsxToTextContent(titleJsx)
    assertWarning(
      navItem.url,
      [
        `${jsxToTextContent(titleInNavJsx)} is missing a URL hash.`,
        `Add a URL hash with: \`## ${sectionTitle}{#some-hash}\`.`,
        /* TO-DO/eventually: not implemented yet.
        `Use \`<h2 id="url-hash">${sectionTitle}</h2>\` instead of \`## ${sectionTitle}\`.`,
        */
      ].join(' '),
    )
  }

  let children: React.JSX.Element = titleInNavJsx
  if (navItem.level === 1) {
    children = (
      <>
        {icon}
        {children}
        <Chevron className="collapsible-icon" height={9} />
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
        d="M10.725 82.42L230.125 261.82c6.8 6.8 16.2 10.7 25.9 10.7s19.1-3.9 25.9-10.7l219.4-179.4c14.3-14.3 14.3-37.4 0-51.7s-37.4-14.3-51.7 0l-193.6 153.6-193.6-153.6c-14.3-14.3-37.4-14.3-51.7 0s-14.3 37.5 0 51.7z"
      />
    </svg>
  )
}
