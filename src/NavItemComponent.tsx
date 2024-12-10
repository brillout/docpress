export { NavItemComponent }
export { getNavItemsWithComputed }
export type { NavItem }
export type { NavItemComputed }
export type { ColumnMap }

import React from 'react'
import { assert, assertWarning, jsxToTextContent } from './utils/server'
import './NavItemComponent.css'
import { parseTitle } from './parseTitle'
import './global.d.ts'

type NavItemComputed = ReturnType<typeof getNavItemsWithComputed>[number]
type NavItem = {
  level: number
  url?: string | null
  color?: string
  title: string
  titleInNav: string
  menuModalFullWidth?: true
  isColumnEntry?: ColumnMap
}
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
