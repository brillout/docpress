export { Layout }
export { containerQueryMobile }

import React from 'react'
import { NavigationContent } from './navigation/Navigation'
import { EditPageNote } from './components/EditPageNote'
import { parseTitle } from './parseTitle'
import { usePageContext } from './renderer/usePageContext'
import { Links } from './Links'
import { hotkeyMenuOpen, toggleMenuModal } from './MenuModal'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from './autoScrollNav'
import { SearchLink } from './docsearch/SearchLink'
import { navigate } from 'vike/client/router'
import { css } from './utils/css'

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
const containerQuerySpacing = mainViewMax + navWidthMax + blockMargin
const containerQueryMobile = mainViewMax + navWidthMin

// Avoid blank whitespace at the bottom of the page with almost no content
const blankBuster1: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}
const blankBuster2: React.CSSProperties = {
  flexGrow: 1,
}

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
          ...blankBuster1,
        }}
      >
        {content}
        <MenuModal />
      </div>
      <style>{css`body { container-type: inline-size; }`}</style>
    </>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const hideNavLeftAlways = pageContext.navItems.length <= 1
  return (
    <>
      <style>{getStyle()}</style>
      <NavMobile />
      <div style={{ display: 'flex', ...blankBuster2 }}>
        <NavLeft />
        <div className="low-prio-grow" style={{ width: 0, maxWidth: 50, background: 'var(--bg-color)' }} />
        <PageContent>{children}</PageContent>
      </div>
    </>
  )
  function getStyle() {
    let style = css`
@container(min-width: ${containerQuerySpacing}px) {
  .low-prio-grow {
    flex-grow: 1;
  }
  #navigation-container {
    width: ${navWidthMax}px !important;
  }
}`
    let navLeftHide = css`
#nav-left {
  display: none;
}
.page-wrapper {
  --main-view-padding: 10px !important;
  flex-grow: 1;
  align-items: center;
}
.page-content {
  margin: auto;
}
`
    if (!hideNavLeftAlways) {
      navLeftHide = css`
@container(max-width: ${containerQueryMobile - 1}px) {
  ${navLeftHide}
}
@container(min-width: ${containerQueryMobile}px) {
  #nav-mobile {
    display: none !important;
  }
}
`
    }
    style += navLeftHide

    return style
  }
}

function LayoutLandingPage({ children }: { children: React.ReactNode }) {
  const mobile = 800
  return (
    <>
      <style>{getStyle()}</style>
      <NavTop />
      <NavMobile />
      <PageContent>{children}</PageContent>
    </>
  )
  function getStyle() {
    return css`
@container(min-width: ${mobile}px) {
  #nav-mobile {
    display: none !important;
  }
}
@container(max-width: ${mobile - 1}px) {
  #top-navigation {
    display: none !important;
  }
`
  }
}

function PageContent({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage, pageTitle } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  const ifDocPage = (style: React.CSSProperties) => (isLandingPage ? {} : style)
  return (
    <div
      className="page-wrapper low-prio-grow"
      style={{
        // Avoid overflow, see https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926
        minWidth: 0,
        ...ifDocPage({
          backgroundColor: 'var(--bg-color)',
          paddingBottom: 50,
        }),
      }}
    >
      <div
        className="page-content"
        style={{
          // Also define --main-view-padding for landing page because it's used by <Contributors> and <Sponsors>
          ['--main-view-padding']: `${mainViewPadding}px`,
          ...ifDocPage({
            width: `calc(${mainViewWidthMax}px + 2 * var(--main-view-padding))`,
            maxWidth: '100%',
            padding: '20px var(--main-view-padding)',
          }),
        }}
      >
        {globalNote}
        {pageTitleParsed && <h1 id={`${pageContext.urlPathname.replace('/', '')}`}>{pageTitleParsed}</h1>}
        {children}
        {!isLandingPage && <EditPageNote pageContext={pageContext} />}
      </div>
    </div>
  )
}

function NavMobile() {
  return (
    <div id="nav-mobile">
      <NavigationHeader headerHeight={50} headerPadding={10} style={{ justifyContent: 'center' }} />
    </div>
  )
}

function NavTop() {
  const pageContext = usePageContext()
  const { topNavigationList, topNavigationStyle } = pageContext
  const paddingSize = 35
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
        <SearchLink style={{ padding }} />
        <MenuLink style={{ padding }} />
        <Links style={{ display: 'inline-flex', padding, marginLeft: -8 }} />
      </div>
    </div>
  )
}

function NavLeft() {
  const pageContext = usePageContext()
  const { navItems, navItemsAll, isDetachedPage } = pageContext
  const headerHeight = 60
  const headerPadding = 10
  return (
    <>
      <div
        id="nav-left"
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
                <NavigationContent navItems={navItems} />
              ) : (
                <NavigationContent navItems={navItemsAll} showOnlyRelevant={true} />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Early scrolling, to avoid flashing */}
      <script dangerouslySetInnerHTML={{ __html: autoScrollNav_SSR }}></script>
    </>
  )
}

function NavigationHeader({
  headerHeight,
  headerPadding,
  style,
}: { headerHeight: number; headerPadding: number; style?: React.CSSProperties }) {
  const pageContext = usePageContext()
  const iconSize = headerHeight - 2 * headerPadding
  //*
  const { projectName } = pageContext.meta
  /*/
  const projectName = 'Vike'
  //*/
  const isProjectNameShort = projectName.length <= 4
  const childrenStyle: React.CSSProperties = {
    flexGrow: 1,
    fontSize: isProjectNameShort ? '4.8cqw' : '4.5cqw',
    ['--icon-padding']: '1.8cqw',
  }
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        borderBottom: 'var(--block-margin) solid white',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: headerHeight,
          containerType: 'inline-size',
          ...navWidth,
        }}
      >
        <a
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            height: '100%',
            padding: `${headerPadding}px 0`,
            paddingLeft: 4,
            ...childrenStyle,
          }}
          href="/"
        >
          <img
            src={pageContext.meta.faviconUrl}
            height={iconSize}
            width={iconSize}
            onContextMenu={(ev) => {
              if (!pageContext.config.pressKit) return // no /press page
              if (window.location.pathname === '/press') return
              ev.preventDefault()
              navigate('/press#logo')
            }}
          />
          <span
            style={{
              marginLeft: `calc(var(--icon-padding) + 2px)`,
              fontSize: isProjectNameShort ? '1.7em' : '1.3em',
            }}
          >
            {projectName}
          </span>
        </a>
        <SearchLink
          style={{
            //
            ...childrenStyle,
          }}
        />
        <MenuLink
          style={{
            //
            ...childrenStyle,
          }}
        />
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
        toggleMenuModal()
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
