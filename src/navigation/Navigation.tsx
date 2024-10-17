export { Navigation }
export { NavigationContent }
export { NavigationMask }
export type { NavigationData }
export type { NavItem }

// TODO/refactor: do this only on the server side?
export { groupByLevelMin }
export type { NavItemGrouped }

import React from 'react'
import { assert, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { parseTitle } from '../parseTitle'
import { autoScrollNav_SSR } from '../autoScrollNav'
import { usePageContext } from '../renderer/usePageContext'
import '@docsearch/css'
import { MobileShowNavigationToggle } from '../MobileHeader'
import { toggleMenu } from './navigation-fullscreen/initNavigationFullscreen'

type NavigationData = Parameters<typeof Navigation>[0]

// TODO: rename navigation => menu-full-content, and menu-left (or navigation-left?)
// TODO: rename NavigationContent => Navigation (or nav-items or something else?)
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
  const headerHeight = 60
  const headerPadding = 10
  return (
    <>
      <NavigationHeader {...{ headerHeight, headerPadding }} />
      <div
        // id="navigation-body"
        style={{
          backgroundColor: 'var(--bg-color)',
          // marginTop: 'var(--block-margin)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div
          id="navigation-container"
          style={{
            top: 0,
            height: `calc(100vh - ${headerHeight}px - var(--block-margin))`,
          }}
        >
          {isDetachedPage ? (
            <>{navItems.length > 1 && <NavigationContent navItems={navItems} currentUrl={currentUrl} />}</>
          ) : (
            <NavigationContent navItems={navItemsAll} currentUrl={currentUrl} />
          )}
        </div>
      </div>
      {/* Early scrolling, to avoid flashing */}
      <script dangerouslySetInnerHTML={{ __html: autoScrollNav_SSR }}></script>
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
  navItems: NavItem[]
  currentUrl: string
}) {
  const navItemsWithComputed = addComputedProps(props.navItems, props.currentUrl)
  const navItemsGrouped = groupByLevelMin(navItemsWithComputed)

  return (
    <div id="navigation-content">
      {navItemsGrouped.map((navItemGroup, i) => (
        <div className="nav-items-group" key={i}>
          <NavItemComponent navItem={navItemGroup} />
          {navItemGroup.navItemChilds.map((navItem, j) => (
            <NavItemComponent navItem={navItem} key={j} />
          ))}
        </div>
      ))}
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

type NavItemGrouped = ReturnType<typeof groupByLevelMin>[number]
function groupByLevelMin<T extends NavItem>(navItems: T[]) {
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

function NavigationHeader({ headerHeight, headerPadding }: { headerHeight: number; headerPadding: number }) {
  const pageContext = usePageContext()
  const iconSize = headerHeight - 2 * headerPadding
  return (
    <div
      id="navigation-header"
      className={pageContext.config.pressKit && 'press-kit'}
      style={{
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        borderBottom: 'var(--block-margin) solid white',
      }}
    >
      <div
        id="navigation-header-content"
        style={{
          display: 'flex',
          // justifyContent: 'center',
          // alignItems: 'center',
          height: headerHeight,
          //borderBottom: 'var(--block-margin) solid white',
        }}
      >
        <a
          id="navigation-header-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            height: '100%',
            /*
            padding: `${padding}px 20px`,
            */
            padding: `${headerPadding}px 4px`,
            // borderLeft: 'var(--block-margin) solid white',
            // borderRight: 'var(--block-margin) solid white',
          }}
          href="/"
        >
          <img src={pageContext.meta.faviconUrl} height={iconSize} width={iconSize} />
          <span
            style={{
              fontSize: '1.25em',
              marginLeft: 10,
            }}
          >
            {pageContext.meta.projectName}
          </span>
        </a>
        {/*
        <div style={{ width: 2, height: 20, backgroundColor: 'white', position: 'relative', right: -34 }}></div>
        */}
        <div
          style={{
            /*
            paddingLeft: 7,
            /*/
            flexGrow: 1,
            paddingRight: 25,
            //*/
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            cursor: 'pointer',
            fontSize: '1.1em',
          }}
          onClick={(ev) => {
            ev.preventDefault()
            toggleMenu()
          }}
        >
          <MobileShowNavigationToggle style={{ padding: '0 11px', display: 'inline-block' }} width={22} />
          Menu
        </div>
      </div>
    </div>
  )
}
