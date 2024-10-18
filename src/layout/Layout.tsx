export { Layout }

import React from 'react'
import { NavigationContent } from '../navigation/Navigation'
import { EditPageNote } from '../components/EditPageNote'
import { parseTitle } from '../parseTitle'
import { usePageContext } from '../renderer/usePageContext'
import { Links } from '../navigation/Links'
import { hotkeyMenuOpen } from '../navigation/navigation-fullscreen/hotkeyMenu'
import { toggleMenu } from '../navigation/navigation-fullscreen/initNavigationFullscreen'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from '../autoScrollNav'
import { SearchLink } from '../docsearch/SearchLink'

const mainViewWidthMax = 800
const mainViewPadding = 20
const navWidthMax = 370
const navWidthMin = 300
const navWidth = {
  minWidth: navWidthMin,
  maxWidth: navWidthMax,
  width: '100%',
}
const blockMargin = 3
const mainViewMax = mainViewWidthMax + mainViewPadding * 2
const mediaQuerySpacing = mainViewMax + navWidthMax + blockMargin
const mediaQueryMobile = mainViewMax + navWidthMin

function Layout({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage } = pageContext

  let content: JSX.Element
  if (isLandingPage) {
    content = <LayoutLandingPage>{children}</LayoutLandingPage>
  } else {
    content = <LayoutDocsPage>{children}</LayoutDocsPage>
  }

  return (
    <>
      <div
        className={isLandingPage ? '' : 'doc-page'}
        style={{
          ['--bg-color']: '#f5f5f7',
          ['--block-margin']: `${blockMargin}px`,
          ['--icon-padding']: '8px',
        }}
      >
        {content}
      </div>
      <MenuModal />
    </>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <MediaQueries />
      <NavigationLeft />
      <div className="low-prio-grow" style={{ width: 0, maxWidth: 50, background: 'var(--bg-color)' }} />
      <PageContent>{children}</PageContent>
    </div>
  )
}

function LayoutLandingPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationTop />
      <PageContent>{children}</PageContent>
    </>
  )
}

function NavigationLeft() {
  return (
    <div
      id="navigation-wrapper"
      style={{
        flexGrow: 1,
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
  )
}

function PageContent({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage, pageTitle } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  const pageContentStyle: React.CSSProperties = {}
  const pageContainerStyle: React.CSSProperties = {}
  const pageWrapperStyle: React.CSSProperties = {}
  if (!isLandingPage) {
    Object.assign(pageContentStyle, {
      padding: '20px var(--main-view-padding)',
    })
    Object.assign(pageContainerStyle, {
      maxWidth: 'calc(var(--main-view-max-width) + 2 * var(--main-view-padding))',
      ['--main-view-max-width']: `${mainViewWidthMax}px`,
      ['--main-view-padding']: `${mainViewPadding}px`,
    })
    Object.assign(pageWrapperStyle, {
      paddingBottom: 50,
    })
  }
  return (
    <div
      className="page-wrapper low-prio-grow"
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        backgroundColor: 'var(--bg-color)',
        // Avoid overflow, see https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926
        minWidth: 0,
        ...pageWrapperStyle,
      }}
    >
      <div
        className="page-container"
        style={{
          ...pageContainerStyle,
        }}
      >
        <MobileHeader />
        <div
          className="page-content"
          style={{
            ...pageContentStyle,
          }}
        >
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

function MediaQueries() {
  const mediaQuery = `
@media screen and (min-width: ${mediaQuerySpacing}px) {
  .low-prio-grow {
    flex-grow: 1;
  }
  #navigation-container {
    width: ${navWidthMax}px !important;
  }
}
@media screen and (max-width: ${mediaQueryMobile - 1}px) {
  .page-content {
    --main-view-padding: 10px !important;
  }
  #top-navigation {
    display: none !important;
  }
}
`
  return <style>{mediaQuery}</style>
}

function NavigationTop() {
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
        fontSize: '1.06em',
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
        style={{
          backgroundColor: 'var(--bg-color)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div
          id="navigation-container"
          style={{
            top: 0,
            height: `calc(100vh - ${headerHeight}px - var(--block-margin))`,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            paddingBottom: 40,
            ...navWidth,
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
  //const { projectName } = pageContext.meta
  const projectName = 'Telefunc'
  const projectNameIsShort = projectName.length <= 4
  //*
  return (
    <div
      id="navigation-header"
      className={pageContext.config.pressKit && 'press-kit'}
      style={{
        containerType: 'inline-size',
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        borderBottom: 'var(--block-margin) solid white',
        ['--icon-padding']: '1.5cqw',
        fontSize: '1.2cqw',
      }}
    >
      <div
        id="navigation-header-content"
        style={{
          display: 'flex',
          height: headerHeight,
          fontSize: '1.05em',
          ...navWidth,
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
            padding: `${headerPadding}px 0`,
            paddingLeft: 4,
          }}
          href="/"
        >
          <img src={pageContext.meta.faviconUrl} height={iconSize} width={iconSize} />
          <span
            style={{
              marginLeft: `var(--icon-padding)`,
              fontSize: '6cqw',
            }}
          >
            {projectName}
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
  return (
    <svg
      style={{ marginRight: 'calc(var(--icon-padding) + 2px)', lineHeight: 0, width: '1.3em' }}
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
