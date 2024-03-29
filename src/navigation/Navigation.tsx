export { Navigation }
export { NavigationMask }
export type { NavigationData }
export type { NavItem }

import React from 'react'
import { NavigationHeader } from './NavigationHeader'
import { assert, Emoji, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { NavigationFullscreenClose } from './navigation-fullscreen/NavigationFullscreenButton'

type NavigationData = Parameters<typeof Navigation>[0]

function Navigation({
  navItems,
  navItemsAll,
  currentUrl,
  isDetachedPage,
}: {
  navItems: NavItem[]
  navItemsAll: NavItem[]
  currentUrl: string
  isDetachedPage: boolean
}) {
  return (
    <>
      <div id="navigation-container">
        <NavigationHeader />
        {isDetachedPage && (
          <>
            {navItems.length > 1 && (
              <NavigationContent id="navigation-content-detached" navItems={navItems} currentUrl={currentUrl} />
            )}
            <DetachedPageNote />
          </>
        )}
        <NavigationContent id="navigation-content-main" navItems={navItemsAll} currentUrl={currentUrl} />
        {/* <ScrollOverlay /> */}
        <NavigationFullscreenClose />
      </div>
    </>
  )
}

function NavigationMask() {
  return <div id="mobile-navigation-mask" />
}

type NavItem = {
  level: number
  url?: string | null
  title: string | JSX.Element
  titleInNav: string | JSX.Element
}
type NavItemComputed = NavItem & {
  isActive: boolean
  isActiveFirst: boolean
  isActiveLast: boolean
  isFirstOfItsKind: boolean
  isLastOfItsKind: boolean
}

function NavigationContent(props: {
  id: 'navigation-content-main' | 'navigation-content-detached'
  navItems: NavItem[]
  currentUrl: string
}) {
  const navItemsWithComputed = addComputedProps(props.navItems, props.currentUrl)
  const navItemsGrouped = groupByLevel1(navItemsWithComputed)

  return (
    <div id={props.id} className="navigation-content">
      <div className="nav-column" style={{ position: 'relative' }}>
        {navItemsGrouped.map((navItemLevel1, i) => (
          <div className="nav-items-level-1-group" key={i}>
            <NavItemComponent navItem={navItemLevel1} />
            {navItemLevel1.navItemChilds.map((navItem, j) => (
              <NavItemComponent navItem={navItem} key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function NavItemComponent({
  navItem,
}: {
  navItem: NavItemComputed
}) {
  assert([1, 2, 3, 4].includes(navItem.level), navItem)
  if (navItem.level === 1 || navItem.level === 4) {
    assert(navItem.url === undefined)
  } else {
    const sectionTitle = jsxToTextContent(navItem.title)
    assertWarning(
      navItem.url,
      `${jsxToTextContent(
        navItem.titleInNav,
      )} is missing a URL hash. Use \`<h2 id="url-hash">${sectionTitle}</h2>\` instead of \`## ${sectionTitle}\`.`,
    )
  }
  return (
    <a
      className={[
        'nav-item',
        'nav-item-level-' + navItem.level,
        navItem.isActive && ' is-active',
        navItem.isActiveFirst && ' is-active-first',
        navItem.isActiveLast && ' is-active-last',
        navItem.isFirstOfItsKind && 'nav-item-first-of-its-kind',
        navItem.isLastOfItsKind && 'nav-item-last-of-its-kind',
      ]
        .filter(Boolean)
        .join(' ')}
      href={navItem.url ?? undefined}
    >
      {/* <span className="nav-item-text">{navItem.titleInNav}</span> */}
      {navItem.titleInNav}
    </a>
  )
}

function groupByLevel1<T extends { level: number }>(navItems: T[]) {
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

function DetachedPageNote() {
  return (
    <div
      id="detached-note"
      style={{
        backgroundColor: 'var(--background-color)',
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 25,
        marginBottom: -5,
        borderRadius: 5,
        padding: 10,
      }}
    >
      <Emoji name="info" />{' '}
      <b>
        <em>Detached</em>
      </b>
      <span
        style={{
          opacity: 0.8,
        }}
      >
        {' '}
        &mdash; this page isn't listed in the navigation below.
      </span>
    </div>
  )
}
