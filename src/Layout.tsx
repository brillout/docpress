export { Layout }

import React from 'react'
import { NavigationContent } from './navigation/Navigation'
import { MobileHeader, MobileShowNavigationToggle } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import './Layout.css'
import { parseTitle } from './parseTitle'
import { usePageContext, usePageContext2 } from './renderer/usePageContext'
import { Links } from './navigation/Links'
import { hotkeyMenuOpen } from './navigation/navigation-fullscreen/hotkeyMenu'
import { toggleMenu } from './navigation/navigation-fullscreen/initNavigationFullscreen'
import { MenuFullModal } from './pages/MenuPage'
import { autoScrollNav_SSR } from './autoScrollNav'

function Layout({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const pageContext2 = usePageContext2()
  const { isLandingPage, pageTitle, noSideNavigation, topNavigationList, topNavigationStyle } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  return (
    <>
      {noSideNavigation && (
        <div
          id="top-navigation"
          style={{
            position: 'relative',
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            marginBottom: 'var(--block-margin)',
            backgroundColor: 'var(--bg-color)',
            ...topNavigationStyle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TopNavigationLink
              rel="external"
              onClick={(ev) => {
                ev.preventDefault()
                toggleMenu()
              }}
              aria-label={hotkeyMenuOpen}
              data-balloon-pos="left"
              data-balloon-blunt
              data-balloon-nofocus
            >
              <MobileShowNavigationToggle style={{ padding: '0 11px' }} />
              Menu
            </TopNavigationLink>
            {topNavigationList.map(({ title, url }) => (
              <TopNavigationLink href={url!} key={url}>
                {title}
              </TopNavigationLink>
            ))}
            <Links style={{ display: 'inline-flex', marginLeft: 5 }} />
          </div>
        </div>
      )}
      <div
        className={['page-layout', isLandingPage ? 'landing-page' : 'doc-page', noSideNavigation && 'noSideNavigation']
          .filter(Boolean)
          .join(' ')}
        // style={{backgroundColor: 'var(--bg-color)'}}
      >
        <div
          id="navigation-wrapper"
          style={{
            borderRight: 'var(--block-margin) solid white',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
            }}
          >
            <Navigation />
          </div>
        </div>
        <div className="page-wrapper">
          <div className="page-container">
            <MobileHeader />
            <div className="page-content">
              {globalNote}
              {pageTitleParsed && <h1 id={`${pageContext.urlPathname.replace('/', '')}`}>{pageTitleParsed}</h1>}
              {children}
              {!isLandingPage && <EditPageNote pageContext={pageContext} />}
            </div>
          </div>
          <div id="mobile-navigation-mask" />
        </div>
      </div>
      <MenuFullModal {...{ pageContext: pageContext2, pageContextResolved: pageContext }} />
    </>
  )
}

function TopNavigationLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      style={{
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 10px',
        cursor: 'pointer',
        color: '#666',
        fontSize: '1.06em',
      }}
      {...props}
    />
  )
}

// TODO: rename navigation => menu-full-content, and menu-left (or navigation-left?)
// TODO: rename NavigationContent => Navigation (or nav-items or something else?)
function Navigation() {
  const pageContext = usePageContext()
  const { navItems, navItemsAll, isDetachedPage } = pageContext
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
            <>{navItems.length > 1 && <NavigationContent navItems={navItems} />}</>
          ) : (
            <NavigationContent navItems={navItemsAll} />
          )}
        </div>
      </div>
      {/* Early scrolling, to avoid flashing */}
      <script dangerouslySetInnerHTML={{ __html: autoScrollNav_SSR }}></script>
    </>
  )
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
