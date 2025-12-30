export { Layout }
export { MenuToggle }
export { viewDesktop }
export { viewTablet }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { bodyMaxWidth }
export { unexpandNav }
export { blockMargin }

// - @media VS @container
//   - Using `@container container-viewport` instead of @media would be interesting because @media doesn't consider the scrollbar width.
//   - But we still use @media because using @container is complicated(/buggy?) to use inside <MenuModal> because of `position: fixed`.
// - We use --padding-side because we cannot set a fixed max-width on the <NavHead> container .nav-head-content — DocPress doesn't know how many extra <NavHead> elements the user adds using the +docpress.topNavigation setting.

import React from 'react'
import { getNavItemsWithComputed, NavItem, NavItemComponent } from './NavItemComponent'
import { parseMarkdownMini } from './parseMarkdownMini'
import { usePageContext } from './renderer/usePageContext'
import { ExternalLinks } from './ExternalLinks'
import {
  closeMenuModalOnMouseLeaveToggle,
  ignoreHoverOnTouchStart,
  openMenuModalOnMouseEnter,
  toggleMenuModal,
} from './MenuModal/toggleMenuModal'
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
import './Layout.css'

const blockMargin = 4
const mainViewPadding = 20
const mainViewWidthMaxInner = 800
const mainViewWidthMax = (mainViewWidthMaxInner + mainViewPadding * 2) as 840 // 840 = 800 + 20 * 2
const navLeftWidthMin = 300
const navLeftWidthMax = 370
const viewMobile = 450
const viewTablet = 1016
const viewDesktop = (mainViewWidthMax + navLeftWidthMin + blockMargin) as 1144 // 1140 = 840 + 300 + 4
const viewDesktopLarge = (mainViewWidthMax + navLeftWidthMax + blockMargin) as 1214 // 1214 = 840 + 370 + 4
const bodyMaxWidth = 1300

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

  const isNavLeftAlwaysHidden_ = isNavLeftAlwaysHidden()
  return (
    <div
      style={{
        ['--color-bg-gray']: '#f5f5f5',
        ['--block-margin']: `${blockMargin}px`,
        // ['--nav-head-height']: `${isLandingPage ? 70 : 63}px`,
        ['--nav-head-height']: `63px`,
        ['--main-view-padding']: `${mainViewPadding}px`,
        // We don't add `container` to `body` nor `html` beacuse in Firefox it breaks the `position: fixed` of <MenuModal>
        // https://stackoverflow.com/questions/74601420/css-container-inline-size-and-fixed-child
        container: 'container-viewport / inline-size',
        maxWidth: isNavLeftAlwaysHidden_ ? undefined : bodyMaxWidth,
        margin: 'auto',
      }}
    >
      <MenuModal isTopNav={isLandingPage} isNavLeftAlwaysHidden_={isNavLeftAlwaysHidden_} />
      <div className={isLandingPage ? '' : 'doc-page'} style={whitespaceBuster1}>
        <NavHead />
        {content}
      </div>
      {/* Early toggling, to avoid layout jumps */}
      <script dangerouslySetInnerHTML={{ __html: initializeJsToggle_SSR }}></script>
      <Style>{getStyleLayout()}</Style>
    </div>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ display: 'flex', ...whitespaceBuster2 }}>
        {!isNavLeftAlwaysHidden() && (
          <>
            <NavLeft />
            <div
              id="nav-left-margin"
              className="low-prio-grow"
              style={{ width: 0, maxWidth: 50, background: 'var(--color-bg-gray)' }}
            />
          </>
        )}
        <PageContent>{children}</PageContent>
      </div>
      <Style>{css`
@container container-viewport (max-width: ${viewDesktopLarge - 1}px) {
  #nav-left {
    flex-grow: 1;
    min-width: ${navLeftWidthMin + blockMargin}px;
  }
}
@container container-viewport (min-width: ${viewDesktopLarge}px) {
  .low-prio-grow {
    flex-grow: 1;
  }
  #nav-left {
    min-width: ${navLeftWidthMax + blockMargin}px;
  }
}
.page-content {
  --hash-offset: 24px;
}
@container container-viewport (max-width: ${viewDesktopLarge - 1}px) and (min-width: ${viewDesktop}px) {
  .page-content {
    --hash-offset: 27px;
  }
}
`}</Style>
    </>
  )
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
  const contentMaxWidth = pageContext.resolved.pageDesign?.contentMaxWidth ?? mainViewWidthMaxInner
  return (
    <div
      className="page-wrapper low-prio-grow"
      style={{
        // We must set min-width to avoid layout overflow on mobile/desktop view.
        // https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926
        minWidth: 0,
        ...ifDocPage({
          backgroundColor: 'var(--color-bg-gray)',
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
            <EditLink className="show-only-on-desktop" style={{ float: 'right', marginTop: 15 }} />
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
          borderRight: 'var(--block-margin) solid var(--color-bg-white)',
          zIndex: 1,
          // We must set min-width to avoid layout overflow when the text of a navigation item exceeds the available width.
          // https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926
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
              backgroundColor: 'var(--color-bg-gray)',
              position: 'relative',
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
                width: '100%',
                // Fade content at top/bottom edges over 20px to 30% opacity
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, black 20px, black calc(100% - 20px), rgba(0,0,0,0.3) 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, black 20px, black calc(100% - 20px), rgba(0,0,0,0.3) 100%)',
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
      <Style>{getStyleNavLeft()}</Style>
    </>
  )
}
function getStyleNavLeft() {
  return css`
.nav-item {
  box-sizing: content-box;
  max-width: ${navLeftWidthMax}px;
}`
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

function isNavLeftAlwaysHidden() {
  const pageContext = usePageContext()
  const { isLandingPage, navItemsDetached, pageDesign } = pageContext.resolved
  return isLandingPage || !!pageDesign?.hideMenuLeft || !!(navItemsDetached && navItemsDetached.length <= 1)
}

const menuLinkStyle: React.CSSProperties = {
  height: '100%',
  padding: '0 var(--padding-side)',
  paddingTop: 2,
  justifyContent: 'center',
}

// Two <NavHead> instances are rendered:
//  - The left-side <NavHead> shown on documentation pages on desktop
//  - The top <NavHead> shown otherwise
function NavHead({ isNavLeft }: { isNavLeft?: true }) {
  const pageContext = usePageContext()
  const { navMaxWidth, name, algolia } = pageContext.globalContext.config.docpress
  const hideNavHeadLogo = pageContext.resolved.isLandingPage && !navMaxWidth

  const navHeadSecondary = (
    <div
      className={cls(['nav-head-secondary', isNavLeft && 'show-on-nav-hover add-transition'])}
      style={{
        padding: 0,
        display: 'flex',
        height: '100%',
        ...(isNavLeft
          ? {
              position: 'absolute',
              left: '100%',
              top: 0,
              width: mainViewWidthMax, // guaranteed real estate
            }
          : {}),
      }}
    >
      {pageContext.globalContext.config.docpress.topNavigation}
      <div className="desktop-grow" style={{ display: 'none' }} />
      <ExternalLinks
        style={{
          display: 'inline-flex',
          fontSize: '1.06em',
          paddingRight: 'var(--main-view-padding)',
          paddingLeft: 'var(--padding-side)',
        }}
      />
    </div>
  )

  return (
    <div
      className={cls(['nav-head link-hover-animation', isNavLeft && 'is-nav-left', !!navMaxWidth && 'has-max-width'])}
      style={{
        backgroundColor: 'var(--color-bg-gray)',
        borderBottom: 'var(--block-margin) solid var(--color-bg-white)',
        position: 'relative',
      }}
    >
      {isNavLeft && <NavHeadLeftFullWidthBackground />}
      <div
        style={{
          // DON'T REMOVE this container: it's needed for the `cqw` values
          container: 'container-nav-head / inline-size',
          width: '100%',
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
          {!hideNavHeadLogo && <NavHeadLogo isNavLeft={isNavLeft} />}
          <div className="desktop-grow" style={{ display: 'none' }} />
          {algolia && <SearchLink className="always-shown" style={menuLinkStyle} />}
          <MenuToggleMain className="always-shown nav-head-menu-toggle" style={menuLinkStyle} />
          {navHeadSecondary}
        </div>
      </div>
    </div>
  )
}
function getStyleLayout() {
  let style = ''

  // Mobile
  style += css`
@media(max-width: ${viewMobile}px) {
  .nav-head:not(.is-nav-left) {
    .nav-head-menu-toggle {
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
}`

  // Mobile + tablet
  style += css`
@media(max-width: ${viewTablet}px) {
  .nav-head:not(.is-nav-left) {
    .nav-head-secondary {
      display: none !important;
    }
  }
}`

  // Tablet
  style += css`
@media(max-width: ${viewTablet}px) and (min-width: ${viewMobile + 1}px) {
  .nav-head:not(.is-nav-left) {
    .nav-head-content {
      --icon-text-padding: 8px;
      --padding-side: 20px;
    }
  }
}`

  // Desktop small + desktop
  style += css`
@media(min-width: ${viewTablet + 1}px) {
  .nav-head:not(.is-nav-left) {
    .nav-head-content {
      --icon-text-padding: min(8px, 0.5cqw);
      --padding-side: min(20px, 1.2cqw);
    }
    &.has-max-width {
      .desktop-grow {
        display: block !important;
      }
      .desktop-grow,
      .nav-head-secondary {
        flex-grow: 1;
      }
    }
  }
  .page-wrapper {
    min-width: ${mainViewWidthMax}px !important;
  }
}
`

  // Desktop
  if (!isNavLeftAlwaysHidden()) {
    style += css`
@container container-viewport (min-width: ${viewDesktop}px) {
  .nav-head:not(.is-nav-left) {
    display: none !important;
  }
  .nav-head.is-nav-left {
    .nav-head-content {
      --icon-text-padding: min(8px, 7 * (1cqw - 2.5px));
      & > :not(.always-shown) {
        --padding-side: min(24px, 27 * (1cqw - 2.5px));
      }
      & > * {
        flex-grow: 0.5;
      }
      & > .nav-head-menu-toggle {
        flex-grow: 1;
      }
    }
  }
  .show-on-nav-hover {
    opacity: 0;
    transition-property: opacity;
    pointer-events: none;
  }
  html:not(.unexpand-nav) {
    & .nav-head.is-nav-left:hover .show-on-nav-hover,
    &:has(.nav-head:hover) #menu-modal-wrapper.show-on-nav-hover,
    &.menu-modal-show .nav-head.is-nav-left .show-on-nav-hover,
    &.menu-modal-show #menu-modal-wrapper.show-on-nav-hover {
      opacity: 1;
      pointer-events: all;
    }
  }
}
@container container-viewport (max-width: ${viewDesktop - 1}px) {
  #nav-left, #nav-left-margin {
    display: none;
  }
  body {
    --main-view-padding: 10px !important;
  }
  ${getStyleNavLeftHidden()}
}
`
  } else {
    style += getStyleNavLeftHidden()
  }

  return style
}
function getStyleNavLeftHidden() {
  return css`
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
}

function unexpandNav() {
  document.documentElement.classList.add('unexpand-nav')
  // Using setTimeout() because requestAnimationFrame() doesn't delay enough
  setTimeout(() => {
    document.documentElement.classList.remove('unexpand-nav')
  }, 1000)
}

function NavHeadLeftFullWidthBackground() {
  return (
    <>
      <div
        className="nav-head-bg show-on-nav-hover add-transition"
        style={{
          height: '100%',
          zIndex: -1,
          background: 'var(--color-bg-gray)',
          position: 'absolute',
          left: 0,
          top: 0,
          boxSizing: 'content-box',
          borderBottom: 'var(--block-margin) solid var(--color-bg-white)',
        }}
      />
      <Style>{
        // (min-width: 0px) => trick to always apply => @container seems to always require a condition
        css`
@container container-viewport (min-width: 0px) {
  .nav-head-bg {
     width: 100cqw;
  }
}
`
      }</Style>
    </>
  )
}

function NavHeadLogo({ isNavLeft }: { isNavLeft?: true }) {
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
      className="nav-head-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        color: 'inherit',
        ...(!isNavLeft
          ? {
              paddingLeft: 'var(--main-view-padding)',
              paddingRight: 'var(--padding-side)',
            }
          : {}),
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
@media(max-width: ${viewTablet}px) {
  .text-docs, .caret-icon {
    display: none !important;
  }
}
@media(min-width: ${viewTablet + 1}px) {
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
        openMenuModalOnMouseEnter(menuId)
      }}
      onMouseLeave={() => {
        closeMenuModalOnMouseLeaveToggle(menuId)
      }}
      onTouchStart={ignoreHoverOnTouchStart}
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
    background-color: var(--color-active);
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
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)', position: 'relative', top: 2 }}
      className="decolorize-5"
    />
  )
}
function MenuIcon() {
  return (
    <div style={{ display: 'inline-block', position: 'relative', top: 2, marginRight: 3, direction: 'rtl' }}>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            style={{
              background: 'currentColor',
              width: (() => {
                if (i === 0) return 18
                if (i === 1) return 11
                return 14
              })(),
              height: 2,
              opacity: '0.8',
              marginTop: i === 0 ? 0 : 4,
            }}
          />
        ))}
    </div>
  )
}
