export { Layout }
export { containerQueryMobileLayout }
export { containerQueryMobileNav as containerQueryMobileMenu }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { unexpandNav }
export { blockMargin }

import React from 'react'
import { getNavItemsWithComputed, NavItem, NavItemComponent } from './NavItemComponent'
import { parseMarkdownMini } from './parseMarkdownMini'
import { usePageContext2 } from './renderer/usePageContext'
import { ExternalLinks } from './ExternalLinks'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from './autoScrollNav'
import { SearchLink } from './docsearch/SearchLink'
import { navigate } from 'vike/client/router'
import { css } from './utils/css'
import { PassThrough } from './utils/PassTrough'
import { Style } from './utils/Style'
import { cls } from './utils/cls'
import { iconBooks } from './icons'
import { EditLink } from './EditLink'
import { menuLinkStyle, MenuToggle } from './MenuToggle'

const blockMargin = 3
const mainViewPadding = 20
const mainViewWidthMax = 800
const mainViewMax = (mainViewWidthMax + mainViewPadding * 2) as 840 // 840 = 800 + 20 * 2
const navLeftWidthMin = 300
const navLeftWidthMax = 370
const containerQuerySmallNav = 550
const containerQueryMobileNav = 1000
const containerQueryMobileLayout = (mainViewMax + navLeftWidthMin) as 1140 // 1140 = 840 + 300
const containerQueryExtraSpace = (mainViewMax + navLeftWidthMax + blockMargin) as 1213 // 1213 = 840 + 370 + 3

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
  const pageContext = usePageContext2()
  const { isLandingPage } = pageContext.pageContextResolved

  let content: React.JSX.Element
  if (isLandingPage) {
    content = <LayoutLandingPage>{children}</LayoutLandingPage>
  } else {
    content = <LayoutDocsPage>{children}</LayoutDocsPage>
  }

  return (
    <div
      style={{
        ['--bg-color']: '#f5f5f5',
        ['--block-margin']: `${blockMargin}px`,
        ['--icon-text-padding']: '8px',
        // ['--nav-head-height']: `${isLandingPage ? 70 : 60}px`,
        ['--nav-head-height']: `60px`,
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
        <NavHead />
        {content}
      </div>
    </div>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext2().pageContextResolved
  const hideNavLeftAlways =
    pageContext.pageDesign?.hideMenuLeft || (pageContext.navItemsDetached && pageContext.navItemsDetached.length <= 1)
  return (
    <>
      <Style>{getStyle()}</Style>
      <div style={{ display: 'flex', ...whitespaceBuster2 }}>
        <NavLeft />
        <div
          id="nav-left-margin"
          className="low-prio-grow"
          style={{ width: 0, maxWidth: 50, background: 'var(--bg-color)' }}
        />
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
    let navLeftHidden = css`
#nav-left, #nav-left-margin {
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
#menu-modal-wrapper {
  position: absolute !important;
}
`
    if (!hideNavLeftAlways) {
      navLeftHidden = css`
@container container-viewport (max-width: ${containerQueryMobileLayout - 1}px) {
  ${navLeftHidden}
}
@container container-viewport (min-width: ${containerQueryMobileLayout}px) {
  .nav-head-full-width {
    display: none !important;
  }
}
`
    }
    style += navLeftHidden

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
  const pageContext = usePageContext2().pageContextResolved
  const { isLandingPage, pageTitle } = pageContext
  const pageTitleParsed = pageTitle && parseMarkdownMini(pageTitle)
  const { globalNote } = pageContext.config
  const ifDocPage = (style: React.CSSProperties) => (isLandingPage ? {} : style)
  const contentMaxWidth = pageContext.pageDesign?.contentMaxWidth ?? mainViewWidthMax
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
            width: `calc(${contentMaxWidth}px + 2 * var(--main-view-padding))`,
            maxWidth: '100%',
            padding: '20px var(--main-view-padding)',
          }),
        }}
      >
        {globalNote}
        {pageTitleParsed && !pageContext.pageDesign?.hideTitle && (
          <div>
            <EditLink className="show-only-on-desktop" style={{ float: 'right', marginTop: 6, padding: 10 }} />
            <h1 id={`${pageContext.urlPathname.replace('/', '')}`}>{pageTitleParsed}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function NavLeft() {
  const pageContext = usePageContext2().pageContextResolved
  const { navItemsAll, navItemsDetached } = pageContext
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
          <NavHead isNavLeft={true} />
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
                height: `calc(100vh - var(--nav-head-height) - var(--block-margin))`,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                paddingBottom: 40,
                minWidth: navLeftWidthMin,
                maxWidth: navLeftWidthMax,
                width: '100%',
              }}
            >
              {navItemsDetached ? (
                <NavigationContent navItems={navItemsDetached} />
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
function NavigationContent(props: {
  navItems: NavItem[]
  showOnlyRelevant?: true
}) {
  const pageContext = usePageContext2().pageContextResolved
  const navItemsWithComputed = getNavItemsWithComputed(props.navItems, pageContext.urlPathname)

  let navItemsRelevant = navItemsWithComputed
  if (props.showOnlyRelevant) navItemsRelevant = navItemsRelevant.filter((navItemGroup) => navItemGroup.isRelevant)
  const navContent = navItemsRelevant.map((navItem, i) => <NavItemComponent navItem={navItem} key={i} />)

  return (
    <div className="navigation-content" style={{ marginTop: 10 }}>
      {navContent}
    </div>
  )
}

function NavHead({ isNavLeft }: { isNavLeft?: true }) {
  const pageContext2 = usePageContext2()
  const pageContext = pageContext2.pageContextResolved
  const { isLandingPage } = pageContext
  const {
    navMaxWidth,
    projectInfo: { projectName },
  } = pageContext.config

  const TopNavigation = pageContext2.config.TopNavigation || PassThrough
  const navSecondaryContent = (
    <div
      className={isNavLeft ? 'show-on-nav-hover add-transition' : 'hide-on-shrink desktop-grow'}
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
              '--padding-side': '20px',
              width: mainViewMax, // guaranteed real estate
            }),
      }}
    >
      <TopNavigation />
      {!isNavLeft && <div className="desktop-grow" />}
      <ExternalLinks
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
      className={cls(['nav-head-top', !isNavLeft && 'nav-head-full-width', 'link-hover-animation'])}
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
          className="nav-head-content"
          style={{
            width: '100%',
            maxWidth: navMaxWidth,
            margin: 'auto',
            height: 'var(--nav-head-height)',
            fontSize: `min(15.2px, ${isProjectNameShort(projectName) ? '4.8cqw' : '4.5cqw'})`,
            color: '#666',
            ['--icon-text-padding']: 'min(8px, 1.8cqw)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <NavLogo className="grow-half" />
          {!isNavLeft && <div className="desktop-grow" />}
          <SearchLink className="grow-half" style={menuLinkStyle} />
          <MenuToggleMain className="grow-full" style={menuLinkStyle} />
          {navSecondaryContent}
        </div>
      </div>
      <Style>{getStyle()}</Style>
    </div>
  )

  function getStyle() {
    let style = css`
@container container-nav-head (max-width: ${containerQuerySmallNav}px) {
  .grow-full {
    flex-grow: 1;
  }
  .grow-half {
    flex-grow: 0.5;
  }
  .nav-head-content {
    --padding-side: 0px;
  }
  .nav-logo {
    justify-content: flex-start;
    padding-left: 15px;
    margin-left: -10px;
  }
}
@container container-viewport (max-width: ${containerQuerySmallNav}px) {
  .grow-half {
    flex-grow: 1 !important;
  }
  .nav-logo {
    justify-content: center;
    padding: 0;
    margin: 0;
  }
}
@container container-nav-head (min-width: 501px) {
  .nav-head-content {
    --padding-side: 24px;
  }
  .nav-logo {
    padding: 0 var(--padding-side);
  }
}
@container container-nav-head (min-width: ${containerQueryMobileNav + 150}px) {
  .nav-head-content {
    --padding-side: 25px;
  }
}
@media(max-width: ${containerQueryMobileNav}px) {
  .hide-on-shrink {
    display: none !important;
  }
}
`
    if (navMaxWidth) {
      style += css`
@media(min-width: ${containerQueryMobileNav + 1}px) {
  .desktop-grow {
    flex-grow: 1;
  }
}
`
    }
    if (isLandingPage && !navMaxWidth)
      style += css`
@media(min-width: ${containerQueryMobileNav + 1}px) {
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
html:not(.unexpand-nav) :has(.nav-head-top:hover) .show-on-nav-hover,
html:not(.unexpand-nav) :has(.show-on-nav-hover:hover) .show-on-nav-hover,
html:not(.unexpand-nav).menu-modal-show .show-on-nav-hover {
  opacity: 1;
  pointer-events: all;
}
`
    }
    return style
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
    <>
      <div
        className="nav-bg show-on-nav-hover add-transition"
        style={{
          height: '100%',
          zIndex: -1,
          background: 'var(--bg-color)',
          position: 'absolute',
          left: 0,
          top: 0,
          boxSizing: 'content-box',
          borderBottom: 'var(--block-margin) solid white',
        }}
      />
      <Style>{
        // (min-width: 0px) => trick to always apply => @container seems to always require a condition
        css`
@container container-viewport (min-width: 0px) {
  .nav-bg {
     width: 100cqw;
  }
}
`
      }</Style>
    </>
  )
}

function NavLogo({ className }: { className: string }) {
  const pageContext = usePageContext2().pageContextResolved
  const iconSize = pageContext.config.navLogoSize ?? 39
  const { projectName } = pageContext.config.projectInfo
  return (
    <a
      className={cls(['nav-logo', className])}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        color: 'inherit',
      }}
      href="/"
    >
      <img
        src={pageContext.meta.logoUrl}
        style={{
          height: iconSize,
          width: iconSize,
          ...pageContext.config.navLogoStyle,
        }}
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
          ...pageContext.config.navLogoTextStyle,
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

type PropsDiv = React.HTMLProps<HTMLDivElement>
function MenuToggleMain(props: PropsDiv) {
  return (
    <MenuToggle menuId={0} {...props}>
      <span className="text-docs" style={{ display: 'flex' }}>
        <DocsIcon /> Docs
      </span>
      <span className="text-menu">
        <MenuIcon /> Menu
      </span>
      <Style>{css`
@media(max-width: ${containerQueryMobileNav}px) {
  .text-docs, .caret-icon {
    display: none !important;
  }
}
@media(min-width: ${containerQueryMobileNav + 1}px) {
  .text-menu {
    display: none;
  }
}
`}</Style>
    </MenuToggle>
  )
}
function DocsIcon() {
  return (
    <img
      src={iconBooks}
      width={18}
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)' }}
      className="decolorize-5"
    />
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
