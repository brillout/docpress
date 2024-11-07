export { Layout }
export { containerQueryMobileLayout }
export { containerQueryMobileMenu }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { unexpandNav }

import React from 'react'
import { NavigationContent } from './navigation/Navigation'
import { EditPageNote } from './components/EditPageNote'
import { parseTitle } from './parseTitle'
import { usePageContext, usePageContext2 } from './renderer/usePageContext'
import { NavSecondaryContent } from './NavSecondaryContent'
import { closeMenuModal, openMenuModal, toggleMenuModal } from './MenuModal'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from './autoScrollNav'
import { SearchLink } from './docsearch/SearchLink'
import { navigate } from 'vike/client/router'
import { css } from './utils/css'
import { PassThrough } from './utils/PassTrough'
import { Style } from './utils/Style'
import { cls } from './utils/cls'

const blockMargin = 3
const mainViewPadding = 20
const mainViewWidthMax = 800
const navLeftWidthMax = 370
const navLeftWidthMin = 300
// 840 = 800 + 20 * 2
const mainViewMax = mainViewWidthMax + mainViewPadding * 2
const containerQueryMobileMenu = 1000
// 1143 = 840 + 300
const containerQueryMobileLayout = mainViewMax + navLeftWidthMin
// 1213 = 840 + 370 + 3
const containerQueryExtraSpace = mainViewMax + navLeftWidthMax + blockMargin

// Avoid whitespace at the bottom of pages with almost no content
const whitespaceBuster1: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}
const whitespaceBuster2: React.CSSProperties = {
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
    <div
      style={{
        ['--bg-color']: '#f5f5f7',
        ['--block-margin']: `${blockMargin}px`,
        ['--icon-text-padding']: '8px',
        ['--top-nav-height']: `${isLandingPage ? 70 : 60}px`,
      }}
    >
      <MenuModal isTopNav={isLandingPage} />
      <div
        className={isLandingPage ? '' : 'doc-page'}
        style={{
          // We don't add `container` to `body` nor `html` beacuse in Firefox it breaks the `position: fixed` of <MenuModal>
          // https://stackoverflow.com/questions/74601420/css-container-inline-size-and-fixed-child
          container: 'container-viewport / inline-size',
          ...whitespaceBuster1,
        }}
      >
        <NavHeader />
        {content}
      </div>
    </div>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const hideNavLeftAlways = pageContext.navItems.length <= 1
  return (
    <>
      <style>{getStyle()}</style>
      <div style={{ display: 'flex', ...whitespaceBuster2 }}>
        <NavLeft />
        <div className="low-prio-grow" style={{ width: 0, maxWidth: 50, background: 'var(--bg-color)' }} />
        <PageContent>{children}</PageContent>
      </div>
    </>
  )
  function getStyle() {
    let style = css`
@container container-viewport (min-width: ${containerQueryExtraSpace}px) {
  .low-prio-grow {
    flex-grow: 1;
  }
  #navigation-container {
    width: ${navLeftWidthMax}px !important;
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
#menu-modal {
  position: absolute !important;
}
`
    if (!hideNavLeftAlways) {
      navLeftHide = css`
@container container-viewport (max-width: ${containerQueryMobileLayout - 1}px) {
  ${navLeftHide}
}
@container container-viewport (min-width: ${containerQueryMobileLayout}px) {
  .nav-header-top {
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
  return (
    <>
      <PageContent>{children}</PageContent>
    </>
  )
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

function NavLeft() {
  const pageContext = usePageContext()
  const { navItems, navItemsAll, isDetachedPage } = pageContext
  const headerHeight = 60
  return (
    <>
      <div
        id="nav-left"
        className="link-hover-animation"
        style={{
          flexGrow: 1,
          borderRight: 'var(--block-margin) solid white',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
          }}
        >
          <NavHeader isNavLeft={true} />
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
                minWidth: navLeftWidthMin,
                maxWidth: navLeftWidthMax,
                width: '100%',
              }}
            >
              {
                // TODO/refactor: simplify?
                isDetachedPage ? (
                  <NavigationContent navItems={navItems} />
                ) : (
                  <NavigationContent navItems={navItemsAll} showOnlyRelevant={true} />
                )
              }
            </div>
          </div>
        </div>
      </div>
      {/* Early scrolling, to avoid flashing */}
      <script dangerouslySetInnerHTML={{ __html: autoScrollNav_SSR }}></script>
    </>
  )
}

function NavHeader({ isNavLeft }: { isNavLeft?: true }) {
  const pageContext = usePageContext()
  const pageContext2 = usePageContext2()
  const { projectName } = pageContext.meta
  const { isLandingPage } = pageContext

  const linkStyle: React.CSSProperties = {
    height: '100%',
    padding: '0 var(--padding-side)',
    justifyContent: 'center',
  }

  const TopNavigation = pageContext2.config.TopNavigation || PassThrough
  const navSecondaryContent = (
    <div
      className={isNavLeft ? 'show-on-nav-hover add-transition' : 'hide-on-shrink'}
      style={{
        padding: 0,
        display: 'flex',
        height: '100%',
        ...(!isNavLeft
          ? {}
          : {
              position: 'absolute',
              left: '100%',
              top: 0,
              paddingLeft: 'var(--block-margin)',
              '--padding-side': '20px',
              width: mainViewMax, // guaranteed real estate
            }),
      }}
    >
      <TopNavigation />
      <NavSecondaryContent
        style={{
          display: 'inline-flex',
          fontSize: '1.06em',
          padding: '0 var(--padding-side)',
          marginLeft: -8,
        }}
      />
    </div>
  )

  return (
    <div
      className={cls(['nav-header-full-width', !isNavLeft && 'nav-header-top', 'link-hover-animation'])}
      style={{
        display: 'flex',
        justifyContent: isNavLeft ? 'flex-end' : 'center',
        backgroundColor: 'var(--bg-color)',
        borderBottom: 'var(--block-margin) solid white',
        position: 'relative',
      }}
    >
      {isNavLeft && <NavHeaderLeftFullWidthBackground />}
      <div
        style={{
          container: 'container-nav-head / inline-size',
          width: '100%',
          minWidth: isNavLeft && navLeftWidthMin,
          maxWidth: isNavLeft && navLeftWidthMax,
        }}
      >
        <div
          className="nav-header-content"
          style={{
            width: '100%',
            height: 'var(--top-nav-height)',
            fontSize: `min(16.96px, ${isProjectNameShort(projectName) ? '4.8cqw' : '4.5cqw'})`,
            color: '#666',
            ['--icon-text-padding']: 'min(8px, 1.8cqw)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <NavLogo className="grow-half" />
          <SearchLink className="grow-half" style={linkStyle} />
          <MenuLink className="grow-full" style={linkStyle} />
          {navSecondaryContent}
        </div>
      </div>
      {getStyle()}
    </div>
  )

  function getStyle() {
    let style = css`
@container container-nav-head (max-width: 500px) {
  .grow-full {
    flex-grow: 1;
  }
  .grow-half {
    flex-grow: 0.5;
  }
  .nav-header-content {
    --padding-side: 0px;
  }
  .nav-logo {
    padding-left: 15px;
    margin-left: -10px;
  }
}
@container container-nav-head (min-width: 501px) {
  .nav-header-content {
    --padding-side: 35px;
  }
  .nav-logo {
    padding: 0 var(--padding-side);
  }
}
@media(max-width: ${containerQueryMobileMenu}px) {
  .hide-on-shrink {
    display: none !important;
  }
}
`
    if (isLandingPage)
      style += css`
@container container-viewport (min-width: 951px) {
  .nav-logo {
    display: none !important;
  }
}
`
    if (isNavLeft) {
      style += css`

.show-on-nav-hover {
  opacity: 0;
  transition-property: opacity;
  pointer-events: none;
}
html:not(.unexpand-nav) :has(.nav-header-full-width:hover) .show-on-nav-hover,
html:not(.unexpand-nav) :has(.show-on-nav-hover:hover) .show-on-nav-hover,
html:not(.unexpand-nav).menu-modal-show .show-on-nav-hover {
  opacity: 1;
  pointer-events: all;
}
`
    }
    return <Style>{style}</Style>
  }
}
function unexpandNav() {
  document.documentElement.classList.add('unexpand-nav')
  // Using setTimeout() because requestAnimationFrame() doesn't delay enough
  setTimeout(() => {
    document.documentElement.classList.remove('unexpand-nav')
  }, 1000)
}

function NavHeaderLeftFullWidthBackground() {
  return (
    <div
      className="show-on-nav-hover add-transition"
      style={{
        height: '100%',
        width: '100vw',
        zIndex: -1,
        background: 'var(--bg-color)',
        position: 'absolute',
        left: 0,
        top: 0,
        boxSizing: 'content-box',
        borderBottom: 'var(--block-margin) solid white',
      }}
    />
  )
}

function NavLogo({ className }: { className: string }) {
  const pageContext = usePageContext()
  const iconSize = 39
  const { projectName } = pageContext.meta
  return (
    <a
      className={cls(['nav-logo', className])}
      style={{
        display: 'flex',
        alignItems: 'center',
        color: 'inherit',
        height: '100%',
        justifyContent: 'flex-start',
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
          marginLeft: `calc(var(--icon-text-padding) + 2px)`,
          fontSize: isProjectNameShort(projectName) ? '1.65em' : '1.3em',
        }}
      >
        {projectName}
      </span>
    </a>
  )
}
function isProjectNameShort(projectName: string) {
  return projectName.length <= 4
}

let onMouseIgnore: ReturnType<typeof setTimeout> | undefined
type PropsDiv = React.HTMLProps<HTMLDivElement>
function MenuLink(props: PropsDiv) {
  return (
    <div
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'default',
        userSelect: 'none',
        ...props.style,
      }}
      className={['colorize-on-hover menu-toggle', props.className].filter(Boolean).join(' ')}
      onClick={(ev) => {
        ev.preventDefault()
        toggleMenuModal()
      }}
      onMouseOver={() => {
        if (onMouseIgnore) return
        openMenuModal()
      }}
      onMouseLeave={() => {
        if (onMouseIgnore) return
        closeMenuModal()
      }}
      onTouchStart={() => {
        onMouseIgnore = setTimeout(() => {
          onMouseIgnore = undefined
        }, 1000)
      }}
    >
      <span className="text-docs">
        <DocsIcon /> Docs
      </span>
      <span className="text-menu">
        <MenuIcon /> Menu
      </span>
      <Style>{css`
@media(max-width: ${containerQueryMobileMenu}px) {
  .text-docs {
    display: none;
  }
}
@media(min-width: ${containerQueryMobileMenu + 1}px) {
  .text-menu {
    display: none;
  }
}
`}</Style>
    </div>
  )
}
function DocsIcon() {
  return (
    <span style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)' }} className="decolorize-6">
      📚
    </span>
  )
}
function MenuIcon() {
  return (
    <svg
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)', verticalAlign: 'top', width: '1.3em' }}
      className="decolorize-6"
      viewBox="0 0 448 512"
    >
      <path
        fill="currentColor"
        d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
      ></path>
    </svg>
  )
}
