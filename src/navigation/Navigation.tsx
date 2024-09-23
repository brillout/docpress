export { Navigation }
export { NavigationMask }
export type { NavigationData }
export type { NavItem }

import React from 'react'
import { NavigationHeader } from './NavigationHeader'
import { assert, Emoji, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { NavigationFullscreenClose } from './navigation-fullscreen/NavigationFullscreenButton'
import { parseTitle } from '../parseTitle'

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
        <div id="navigation-body">
          {isDetachedPage && (
            <>
              {navItems.length > 1 && (
                <NavigationContent id="navigation-content-detached" navItems={navItems} currentUrl={currentUrl} />
              )}
              <DetachedPageNote />
            </>
          )}
          <NavigationContent id="navigation-content-main" navItems={navItemsAll} currentUrl={currentUrl} />
          <NavigationFullscreenClose />
        </div>
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
  id: 'navigation-content-main' | 'navigation-content-detached'
  navItems: NavItem[]
  currentUrl: string
}) {
  const navItemsWithComputed = addComputedProps(props.navItems, props.currentUrl)
  const navItemsGrouped = groupByLevelMin(navItemsWithComputed)
  propageIsActive(navItemsGrouped)

  return (
    <div id={props.id} className="navigation-content">
      <div className="nav-column" style={{ position: 'relative' }}>
        {navItemsGrouped.map((navItemGroup, i) => (
          <div
            className={['nav-items-group', navItemGroup.isActive && 'is-active-group'].filter(Boolean).join(' ')}
            key={i}
          >
            <NavItemComponent navItem={navItemGroup} />
            {navItemGroup.navItemChilds.map((navItem, j) => (
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

function groupByLevelMin(navItems: NavItemComputed[]) {
  const navItemsGrouped: (NavItemComputed & { navItemChilds: NavItemComputed[] })[] = []
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

type NavItemsGrouped = ReturnType<typeof groupByLevelMin>
function propageIsActive(navItemsGrouped: NavItemsGrouped): void {
  navItemsGrouped.forEach((navItemGroup) => {
    if (navItemGroup.level !== 1) return
    navItemGroup.navItemChilds.forEach((navItem) => {
      if (navItem.isActive) {
        navItemGroup.isActive = true
      }
    })
  })
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
