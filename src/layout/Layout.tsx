export { Layout }

import React from 'react'
import { NavigationContent } from '../navigation/Navigation'
import { EditPageNote } from '../components/EditPageNote'
import './Layout.css'
import { parseTitle } from '../parseTitle'
import { usePageContext } from '../renderer/usePageContext'
import { Links } from '../navigation/Links'
import { hotkeyMenuOpen } from '../navigation/navigation-fullscreen/hotkeyMenu'
import { toggleMenu } from '../navigation/navigation-fullscreen/initNavigationFullscreen'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from '../autoScrollNav'
import { SearchLink } from '../docsearch/SearchLink'

function Layout(props: { children: React.ReactNode }) {
  const pageContext = usePageContext()

  if (pageContext.isLandingPage) return <LayoutLandingPage {...props} />

  return <LayoutDoc {...props} />
}

function LayoutDoc({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage, noSideNavigation } = pageContext
  return (
    <>
      {noSideNavigation && <TopNavigation />}
      <div
        className={['page-layout', !isLandingPage && 'doc-page', noSideNavigation && 'noSideNavigation']
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
        <PageContent>{children}</PageContent>
      </div>
      <MenuModal />
    </>
  )
}

function LayoutLandingPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavigation />
      <div
        className={['page-layout', 'noSideNavigation'].filter(Boolean).join(' ')}
        // style={{backgroundColor: 'var(--bg-color)'}}
      >
        <PageContent>{children}</PageContent>
      </div>
      <MenuModal />
    </>
  )
}

function PageContent({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage, pageTitle } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  return (
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
      {/* TODO: remove */}
      <div id="mobile-navigation-mask" />
    </div>
  )
}

function TopNavigation() {
  const pageContext = usePageContext()
  const { topNavigationList, topNavigationStyle } = pageContext
  const paddingSize = 14
  const padding = `0 ${paddingSize}px`
  return (
    <div
      id="top-navigation"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        marginBottom: 'var(--block-margin)',
        backgroundColor: 'var(--bg-color)',
        color: '#666',
        ...topNavigationStyle,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: 70 }}>
        {topNavigationList.map(({ title, url }) => (
          <a
            href={url!}
            key={url}
            style={{
              color: 'inherit',
              height: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.06em',
              padding,
              marginRight: 7,
            }}
          >
            {title}
          </a>
        ))}
        <MenuLink style={{ padding }} />
        <SearchLink style={{ padding }} />
        <Links style={{ display: 'inline-flex', padding, marginLeft: -8 }} />
      </div>
    </div>
  )
}

// TODO: rename navigation => menu-left (or navigation-left?)
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
          height: headerHeight,
          fontSize: '1.05em',
        }}
      >
        <a
          id="navigation-header-logo"
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            height: '100%',
            padding: `${headerPadding}px 4px`,
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
        <SearchLink style={{ flexGrow: 1 }} />
        <MenuLink style={{ flexGrow: 1 }} />
      </div>
    </div>
  )
}

function MobileHeader() {
  return (
    <div
      id="mobile-header"
      style={{
        height: 'var(--mobile-header-height)',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          zIndex: 99,
          top: 0,
          left: 0,
          height: 'var(--mobile-header-height)',
          width: '100%',
          borderBottom: '1px solid #ddd',
        }}
      >
        <MenuIcon />
        <a
          href="/"
          style={{
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            textDecoration: 'none',
          }}
        >
          TODO
        </a>
      </div>
    </div>
  )
}

type PropsDiv = React.HTMLProps<HTMLDivElement>
function MenuLink(props: PropsDiv) {
  return (
    <div
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        ...props.style,
      }}
      className="colorize-on-hover"
      onClick={(ev) => {
        ev.preventDefault()
        toggleMenu()
      }}
      aria-label={hotkeyMenuOpen}
      data-balloon-pos="left"
      data-balloon-blunt
      data-balloon-nofocus
    >
      <MenuIcon />
      Menu
    </div>
  )
}
function MenuIcon() {
  const size = '1.9em'
  return (
    <svg
      style={{ paddingRight: 11, lineHeight: 0, width: size, height: size }}
      className="decolorize-7"
      viewBox="0 0 448 512"
    >
      <path
        fill="currentColor"
        d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
      ></path>
    </svg>
  )
}
