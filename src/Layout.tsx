export { Layout }
export { MenuToggle }
export { containerQueryMobileLayout }
export { containerQueryMobileNav as containerQueryMobileMenu }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { unexpandNav }
export { blockMargin }

import React from 'react'
import { getNavItemsWithComputed, NavItem, NavItemComponent } from './NavItemComponent'
import { parseMarkdownMini } from './parseMarkdownMini'
import { usePageContext } from './renderer/usePageContext'
import { ExternalLinks } from './ExternalLinks'
import { coseMenuModalOnMouseLeave, openMenuModal, toggleMenuModal } from './MenuModal/toggleMenuModal'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from './autoScrollNav'
import { initializeJsToggle_SSR } from './code-blocks/hooks/useSelectCodeLang'
import { SearchLink } from './docsearch/SearchLink'
import { navigate } from 'vike/client/router'
import { css } from './utils/css'
import { Style } from './utils/Style'
import { cls } from './utils/cls'
import { iconBooks } from './icons'
import { EditLink } from './EditLink'

const blockMargin = 3
const mainViewPadding = 20
const mainViewWidthMax = 800
const mainViewMax = (mainViewWidthMax + mainViewPadding * 2) as 840 // 840 = 800 + 20 * 2
const navLeftWidthMin = 300
const navLeftWidthMax = 370
const containerQueryMobile = 450
// TODO: rename
const containerQueryMobileNav = 1000
// TODO: rename
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
  const pageContext = usePageContext()
  const { isLandingPage } = pageContext.resolved

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
        // ['--nav-head-height']: `${isLandingPage ? 70 : 63}px`,
        ['--nav-head-height']: `63px`,
        ['--main-view-padding']: `${mainViewPadding}px`,
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
      {/* Early toggling, to avoid layout jumps */}
      <script dangerouslySetInnerHTML={{ __html: initializeJsToggle_SSR }}></script>
    </div>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  // TODO: rename hideNavLeftAlways isNavLeftAlwaysHidden
  const hideNavLeftAlways =
    pageContext.resolved.pageDesign?.hideMenuLeft ||
    (pageContext.resolved.navItemsDetached && pageContext.resolved.navItemsDetached.length <= 1)
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
body {
  --main-view-padding: 10px !important;
}
.page-wrapper {
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
  .nav-head-content {
    --icon-text-padding: min(8px, 7 * (1cqw - 2.5px));
    & > :not(.always-shown) {
      --padding-side: min(24px, 27 * (1cqw - 2.5px));
    }
    & > * {
      flex-grow: 0.5;
    }
    & > .menu-button {
      flex-grow: 1;
    }
  }
  .nav-logo {
    padding-left: var(--main-view-padding);
    margin-left: calc(-1 * var(--main-view-padding));
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
  const pageContext = usePageContext()
  const { isLandingPage, pageTitle } = pageContext.resolved
  const pageTitleParsed = pageTitle && parseMarkdownMini(pageTitle)
  /*
  const { globalNote } = pageContext.globalContext.config.docpress
  */
  const ifDocPage = (style: React.CSSProperties) => (isLandingPage ? {} : style)
  const contentMaxWidth = pageContext.resolved.pageDesign?.contentMaxWidth ?? mainViewWidthMax
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
          ...ifDocPage({
            width: `calc(${contentMaxWidth}px + 2 * var(--main-view-padding))`,
            maxWidth: '100%',
            padding: '20px var(--main-view-padding)',
          }),
        }}
      >
        {/* globalNote */}
        {pageTitleParsed && !pageContext.resolved.pageDesign?.hideTitle && (
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
  const pageContext = usePageContext()
  const { navItemsAll, navItemsDetached } = pageContext.resolved
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
  const pageContext = usePageContext()
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

const menuLinkStyle: React.CSSProperties = {
  height: '100%',
  padding: '0 var(--padding-side)',
  justifyContent: 'center',
}

function NavHead({ isNavLeft }: { isNavLeft?: true }) {
  const pageContext = usePageContext()
  const { isLandingPage } = pageContext.resolved
  const { navMaxWidth, name, algolia } = pageContext.globalContext.config.docpress

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
              width: mainViewMax, // guaranteed real estate
            }),
      }}
    >
      {pageContext.globalContext.config.docpress.topNavigation}
      <div className="desktop-grow" style={{ display: 'none' }} />
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
            fontSize: `min(14.2px, ${isProjectNameShort(name) ? '4.8cqw' : '4.5cqw'})`,
            color: '#666',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* TODO: remove grow-full grow-half */}
          <NavLogo className="grow-half" />
          <div className="desktop-grow" style={{ display: 'none' }} />
          {algolia && <SearchLink className="grow-half always-shown" style={menuLinkStyle} />}
          <MenuToggleMain className="grow-full always-shown menu-button" style={menuLinkStyle} />
          {navSecondaryContent}
        </div>
      </div>
      <Style>{getStyle()}</Style>
    </div>
  )

  function getStyle() {
    // TODO: comment
    let style = css`
@container container-viewport (max-width: ${containerQueryMobile}px) {
  .nav-logo {
    always-shown: flex-start !important;
    padding-left: var(--main-view-padding);
  }
  .menu-button {
    justify-content: flex-end !important;
    padding-right: var(--main-view-padding) !important;
  }
  .nav-head-content {
    --icon-text-padding: min(8px, 1.3cqw);
    & > * {
      flex-grow: 1;
    }
  }
}
@container container-viewport (max-width: ${containerQueryMobileNav}px) {
  .hide-on-shrink {
    display: none !important;
  }
}
@container container-viewport (max-width: ${containerQueryMobileNav}px) and (min-width: ${containerQueryMobile}px) {
  .nav-head-content {
    --icon-text-padding: 8px;
    --padding-side: 20px;
  }
  .nav-logo {
    padding: 0 var(--padding-side);
  }
}
@container container-nav-head (min-width: ${containerQueryMobileNav + 1}px) {
  .nav-head-content {
    --icon-text-padding: min(8px, 0.5cqw);
    --padding-side: min(20px, 1.3cqw);
  }
  .nav-logo {
    padding: 0 var(--padding-side);
  }
}
`
    if (navMaxWidth) {
      style += css`
@container container-nav-head (min-width: ${containerQueryMobileNav + 1}px) {
  .desktop-grow {
    display: block;
    flex-grow: 1;
  }
}
`
    }
    if (isLandingPage && !navMaxWidth)
      style += css`
@container container-viewport (min-width: ${containerQueryMobileNav + 1}px) {
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
  const pageContext = usePageContext()

  const { navLogo } = pageContext.globalContext.config.docpress
  let navLogoResolved = navLogo
  if (!navLogoResolved) {
    const iconSize = pageContext.globalContext.config.docpress.navLogoSize ?? 39
    const { name, logo, navLogoStyle, navLogoTextStyle } = pageContext.globalContext.config.docpress
    navLogoResolved = (
      <>
        <img
          src={logo}
          style={{
            height: iconSize,
            width: iconSize,
            ...navLogoStyle,
          }}
          onContextMenu={onContextMenu}
        />
        <span
          style={{
            marginLeft: `calc(var(--icon-text-padding) + 2px)`,
            fontSize: isProjectNameShort(name) ? '1.65em' : '1.3em',
            ...navLogoTextStyle,
          }}
        >
          {name}
        </span>
      </>
    )
  }

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
      onContextMenu={!navLogo ? undefined : onContextMenu}
    >
      {navLogoResolved}
    </a>
  )

  function onContextMenu(ev: React.MouseEvent<unknown, MouseEvent>) {
    if (!pageContext.globalContext.config.docpress.pressKit) return // no /press page
    if (window.location.pathname === '/press') return
    ev.preventDefault()
    navigate('/press#logo')
  }
}
function isProjectNameShort(name: string) {
  return name.length <= 4
}

let onMouseIgnore: ReturnType<typeof setTimeout> | undefined
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
@container container-viewport (max-width: ${containerQueryMobileNav}px) {
  .text-docs, .caret-icon {
    display: none !important;
  }
}
@container container-viewport (min-width: ${containerQueryMobileNav + 1}px) {
  .text-menu {
    display: none;
  }
}
`}</Style>
    </MenuToggle>
  )
}
function MenuToggle({ menuId, ...props }: PropsDiv & { menuId: number }) {
  return (
    <div
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        ...menuLinkStyle,
        ...props.style,
      }}
      className={[`colorize-on-hover menu-toggle menu-toggle-${menuId}`, props.className].filter(Boolean).join(' ')}
      onClick={(ev) => {
        ev.preventDefault()
        toggleMenuModal(menuId)
      }}
      onMouseEnter={() => {
        if (onMouseIgnore) return
        if (isMobileNav()) return
        openMenuModal(menuId)
      }}
      onMouseLeave={() => {
        if (onMouseIgnore) return
        if (isMobileNav()) return
        coseMenuModalOnMouseLeave(menuId)
      }}
      onTouchStart={() => {
        onMouseIgnore = setTimeout(() => {
          onMouseIgnore = undefined
        }, 1000)
      }}
    >
      <Style>{getAnimation()}</Style>
      {props.children}
      <CaretIcon
        style={{
          width: 11,
          marginLeft: 'calc(var(--icon-text-padding) - 1px)',
          flexShrink: 0,
          color: '#888',
          position: 'relative',
          top: 1,
        }}
      />
    </div>
  )

  function getAnimation() {
    return css`
.menu-toggle {
  position: relative;
  overflow: hidden;
  z-index: 0;
  @media (hover: hover) and (pointer: fine) {
    .link-hover-animation &:hover::before {
      top: 0;
    }
    html.menu-modal-show & {
      cursor: default !important;
    }
  }
  &::before {
    position: absolute;
    content: '';
    height: 100%;
    width: 100%;
    top: var(--nav-head-height);
    background-color: var(--active-color);
    transition-property: top !important;
    transition: top 0.4s ease !important;
    z-index: -1;
  }
  & .caret-icon-left,
  & .caret-icon-right {
    transition: transform .4s cubic-bezier(.4,0, .2, 1);
  }
  & .caret-icon-left {
    transform-origin: 25% 50%;
  }
  & .caret-icon-right {
    transform-origin: 75% 50%;
  }
}
    `
  }
}
function CaretIcon({ style }: { style: React.CSSProperties }) {
  return (
    // - Inspired by stripe.com
    // - Alternative caret SVGs: https://gist.github.com/brillout/dbf05e1fb79a34169cc2d0d5eaf58c01
    // - The rounded caret (`caret.svg`) doesn't look nice when flipped:
    // -   https://github.com/brillout/docpress/commit/0ff937d8caf5fc439887ef495e2d2a700234dfb1
    // - https://github.com/brillout/docpress/pull/39
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 9.24 5.858"
      style={{
        overflow: 'visible',
        ...style,
      }}
      className="caret-icon"
    >
      <g className="caret-icon-left">
        <path
          fill="currentColor"
          d="m4.001 5.24.619.618 1.237-1.237-.618-.619L4 5.241zm-4-4 4 4L5.24 4.001l-4-4L0 1.241z"
        ></path>
      </g>
      <g className="caret-icon-right">
        <path fill="currentColor" d="m5.239 5.239-.619.618L3.383 4.62l.618-.619L5.24 5.24Zm4-4-4 4L4 4l4-4z"></path>
      </g>
    </svg>
  )
}
function DocsIcon() {
  return (
    <img
      src={iconBooks}
      width={18}
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)', position: 'relative', top: 1 }}
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

function isMobileNav() {
  return window.innerWidth <= containerQueryMobileNav
}
