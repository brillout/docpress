export { Layout }
export { MenuToggle }
export { viewDesktop }
export { viewTablet }
export { viewMobile }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { bodyMaxWidth }
export { scrollFadeMask }
export { barShadow }

// - @media VS @container
//   - Using `@container container-viewport` instead of @media would be interesting because @media doesn't consider the scrollbar width.
//   - But we still use @media because using @container is complicated(/buggy?) to use inside <MenuModal> because of `position: fixed`.
// - We use --padding-side because we cannot set a fixed max-width on the <NavHead> container .nav-head-content — DocPress doesn't know how many extra <NavHead> elements the user adds using the +docpress.topNavigation setting.

import React from 'react'
import { getNavItemsWithComputed, NavItem, NavItemComponent } from './NavItemComponent.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { usePageContext } from './renderer/usePageContext.js'
import { ExternalLinks } from './ExternalLinks.js'
import {
  closeMenuModalOnMouseLeaveToggle,
  ignoreHoverOnTouchStart,
  openMenuModalOnMouseEnter,
  toggleMenuModal,
} from './MenuModal/toggleMenuModal.js'
import { MenuModal } from './MenuModal.js'
import { autoScrollNav_SSR } from './autoScrollNav.js'
import { initializeChoiceGroup_SSR } from './code-blocks/hooks/useCurrentSelection.js'
import { SearchLink } from './docsearch/SearchLink.js'
import { navigate } from 'vike/client/router'
import { css } from './utils/css.js'
import { Style } from './utils/Style.js'
import { cls } from './utils/cls.js'
import { iconBooks } from './icons/index.js'
import { PageHeader, PageFooter } from './PageChrome.js'
import { TocRail, tocRailWidth, viewTocRail } from './TocRail.js'
import { CategoryTabs } from './CategoryTabs.js'
import { ThemeToggle } from './theme/ThemeToggle.js'
import './Layout.css'

// Hairline between the top nav, the left nav and the page
const blockMargin = 1
const navHeadHeight = 63
const mainViewPadding = 20
// About 75 characters per line
const mainViewWidthMaxInner = 720
const mainViewWidthMax = (mainViewWidthMaxInner + mainViewPadding * 2) as 760 // 760 = 720 + 20 * 2
const navLeftWidthMin = 300
const navLeftWidthMax = 370
const viewMobile = 450
const viewTablet = 1016
const viewDesktop = (mainViewWidthMax + navLeftWidthMin + blockMargin) as 1061 // 1061 = 760 + 300 + 1
const viewDesktopLarge = (mainViewWidthMax + navLeftWidthMax + blockMargin) as 1131 // 1131 = 760 + 370 + 1
// The frame: left navigation + page content + "On this page", and not wider (the eye doesn't travel far)
const bodyMaxWidth = 1340
// A bar (the top nav, the category tabs): the bottom hairline, and copies of the bar left and right of it, so that it
// spans the viewport also beyond `bodyMaxWidth`
const barShadow = [
  `0 ${blockMargin}px 0 var(--dp-color-border)`,
  `-${bodyMaxWidth}px 0 0 var(--dp-color-bg)`,
  `${bodyMaxWidth}px 0 0 var(--dp-color-bg)`,
  `-${bodyMaxWidth}px ${blockMargin}px 0 var(--dp-color-border)`,
  `${bodyMaxWidth}px ${blockMargin}px 0 var(--dp-color-border)`,
].join(', ')

// Scroll fade effect at top/bottom edges: `.scroll-fade` (scroll-fade.css), only while the container actually scrolls
const scrollFadeMask: React.CSSProperties = {
  // Force hardware acceleration to fix Chrome rendering bug (temporary bold text upon scrolling)
  transform: 'translateZ(0)',
}

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
  const { isLandingPage, pageDesign } = pageContext.resolved
  const isTopNavSticky = !isLandingPage && (pageDesign?.topNavSticky ?? true)

  let content: React.JSX.Element
  if (isLandingPage) {
    content = <LayoutLandingPage>{children}</LayoutLandingPage>
  } else {
    content = <LayoutDocsPage>{children}</LayoutDocsPage>
  }

  const isNavLeftAlwaysHidden_ = isNavLeftAlwaysHidden()
  const hasCategoryTabs = !!pageContext.globalContext.config.docpress.categoryTabs && !isLandingPage
  return (
    <div
      className={hasCategoryTabs ? 'has-category-tabs' : undefined}
      style={{
        ['--block-margin']: `${blockMargin}px`,
        ['--nav-head-height']: `${navHeadHeight}px`,
        // Offset for elements sitting below the sticky top nav
        // (The category tabs' height, see getStyleLayout())
        ['--nav-head-sticky-offset']: isTopNavSticky
          ? 'calc(var(--nav-head-height) + var(--nav-tabs-height, 0px))'
          : '0px',
        ['--main-view-padding']: `${mainViewPadding}px`,
        // We don't add `container` to `body` nor `html` beacuse in Firefox it breaks the `position: fixed` of <MenuModal>
        // https://stackoverflow.com/questions/74601420/css-container-inline-size-and-fixed-child
        container: 'container-viewport / inline-size',
        maxWidth: isNavLeftAlwaysHidden_ ? undefined : bodyMaxWidth,
        margin: 'auto',
      }}
    >
      {/* Before the markup it styles: the first paint has the right layout */}
      <Style>{getStyleLayout()}</Style>
      {/* Focused elements aren't hidden under the sticky top nav (for headings, see heading.css) */}
      {isTopNavSticky && (
        <Style>{`:where(a, button, input, select, textarea, summary, [tabindex]):focus { scroll-margin-top: calc(var(--nav-head-sticky-offset) + 16px); }`}</Style>
      )}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className={isLandingPage ? 'landing-page' : 'doc-page'} style={whitespaceBuster1}>
        <header style={{ position: isTopNavSticky ? 'sticky' : 'relative', top: 0, zIndex: 100 }}>
          <NavHead />
          {hasCategoryTabs && <CategoryTabs />}
          {/* <MenuModal> is inside here because `container-type` on the page wrapper traps `position: fixed` — https://github.com/brillout/docpress/pull/177 */}
          <MenuModal isNavLeftAlwaysHidden_={isNavLeftAlwaysHidden_} />
        </header>
        {content}
      </div>
      {/* Early toggling, to avoid layout jumps */}
      <script dangerouslySetInnerHTML={{ __html: `${initializeChoiceGroup_SSR}` }}></script>
    </div>
  )
}

function LayoutDocsPage({ children }: { children: React.ReactNode }) {
  const { navItemsDetached, tocItems } = usePageContext().resolved
  // The rail lists the page's sections: a detached page's left navigation would only list the page itself
  const isNavLeftHiddenByTocRail = !!navItemsDetached && tocItems.length > 0
  return (
    <>
      <Style>{css`
@container container-viewport (width < ${viewDesktopLarge}px) {
  #nav-left {
    flex-grow: 1;
    min-width: ${navLeftWidthMin + blockMargin}px;
  }
}
@container container-viewport (width >= ${viewDesktopLarge}px) {
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
@container container-viewport (${viewDesktop}px <= width < ${viewDesktopLarge}px) {
  .page-content {
    --hash-offset: 27px;
  }
}
${
  // Only where <TocRail> is rendered (below)
  isNavLeftAlwaysHidden()
    ? ''
    : css`
@container container-viewport (width < ${viewTocRail}px) {
  #toc-rail {
    display: none;
  }
}
@container container-viewport (width >= ${viewTocRail}px) {
  #toc-rail {
    width: ${tocRailWidth}px;
  }
  /* The page content gives up some width to the rail */
  .page-wrapper {
    min-width: ${mainViewWidthMax - 120}px;
  }
  /* The rail lists the page's sections: don't also expand them in the left navigation */
  #nav-left .nav-item-level-3 {
    display: none;
  }
  /* The content is centered between the left navigation and the rail */
  #nav-left-margin {
    display: none;
  }
  .page-content {
    margin-inline: auto;
  }
}
@container container-viewport (${viewTocRail}px <= width < ${viewTocRail + 120}px) {
  #nav-left {
    /* Make room for the rail */
    min-width: ${navLeftWidthMin + blockMargin}px;
  }
  /* Some air between the three columns (the measure is still ~70 characters) */
  .page-content {
    --main-view-padding: 32px;
  }
}`
}
${
  !isNavLeftHiddenByTocRail
    ? ''
    : css`
@container container-viewport (width >= ${viewTocRail}px) {
  #nav-left, #nav-left-margin {
    display: none;
  }
  ${getStyleNavLeftHidden()}
}`
}
`}</Style>
      <div style={{ display: 'flex', ...whitespaceBuster2 }}>
        {!isNavLeftAlwaysHidden() && (
          <>
            <NavLeft />
            <div id="nav-left-margin" className="low-prio-grow" style={{ width: 0, maxWidth: 50 }} />
          </>
        )}
        {/* Before the page content in the HTML (it's parsed and painted with the first chunk: the content doesn't
            shift when it arrives), after it on the screen (flex order, TocRail.css) */}
        {!isNavLeftAlwaysHidden() && <TocRail />}
        <PageContent>{children}</PageContent>
      </div>
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
  const ifDocPage = (style: React.CSSProperties) => (isLandingPage ? {} : style)
  const contentMaxWidth = pageContext.resolved.pageDesign?.contentMaxWidth ?? mainViewWidthMaxInner
  return (
    <main
      id="main-content"
      // The skip link moves the focus here
      tabIndex={-1}
      className="page-wrapper low-prio-grow"
      style={ifDocPage({ paddingBottom: 50 })}
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
        {pageTitleParsed && !pageContext.resolved.pageDesign?.hideTitle && <PageHeader title={pageTitleParsed} />}
        {children}
        {!isLandingPage && <PageFooter />}
      </div>
    </main>
  )
}

function NavLeft() {
  const pageContext = usePageContext()
  const { navItemsAll, navItemsDetached } = pageContext.resolved
  return (
    <>
      <Style>{getStyleNavLeft()}</Style>
      <nav
        id="nav-left"
        aria-label="Docs"
        className="link-hover-animation"
        style={{
          borderRight: 'var(--block-margin) solid var(--dp-color-border)',
          zIndex: 1,
          // We must set min-width to avoid layout overflow when the text of a navigation item exceeds the available width.
          // https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926
        }}
      >
        <div
          style={{
            position: 'sticky',
            // Sit below the sticky top nav (or at the very top when the top nav isn't sticky)
            top: 'var(--nav-head-sticky-offset)',
          }}
        >
          <div>
            <div
              id="navigation-container"
              className="scroll-fade"
              style={{
                top: 0,
                height: `calc(100vh - var(--nav-head-sticky-offset) - var(--block-margin))`,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                paddingBottom: 40,
                minWidth: navLeftWidthMin,
                width: '100%',
                ...scrollFadeMask,
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
      </nav>
      {/* Early scrolling, to avoid flashing */}
      <script dangerouslySetInnerHTML={{ __html: autoScrollNav_SSR }}></script>
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

function NavHead() {
  const pageContext = usePageContext()
  const {
    navMaxWidth,
    name,
    algolia,
    darkMode,
    categoryTabs,
    docsUrl: docsUrlSetting,
    topNavigation,
  } = pageContext.globalContext.config.docpress
  const { isLandingPage } = pageContext.resolved
  const hideNavHeadLogo = isLandingPage && !navMaxWidth
  // With category tabs, the landing page's "Docs" is a link into the docs, where the tabs take over (on desktop)
  const docsUrl =
    categoryTabs && isLandingPage
      ? (docsUrlSetting ?? pageContext.resolved.categories.flatMap((category) => category.pages)[0]?.url)
      : undefined
  const hasCategoryTabs = !!categoryTabs && !isLandingPage
  // The category tabs without `topNavigation`: the search alone between the logo and the links, centered in the bar
  const isSearchCentered = !!navMaxWidth && hasCategoryTabs && !topNavigation

  const navHeadSecondary = (
    <div className="nav-head-secondary">
      {topNavigation}
      {navMaxWidth && <div className="desktop-grow" />}
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
    <nav
      aria-label="Main"
      className={cls(['nav-head link-hover-animation', !!navMaxWidth && 'has-max-width'])}
      style={{
        backgroundColor: 'var(--dp-color-bg)',
        position: 'relative',
        boxShadow: barShadow,
      }}
    >
      <div
        style={{
          // DON'T REMOVE this container: it's needed for the `cqw` values
          container: 'container-nav-head / inline-size',
          width: '100%',
          // Cap the cqw context so nav-item spacing matches between landing and doc pages.
          maxWidth: bodyMaxWidth,
          margin: '0 auto',
        }}
      >
        <div
          className={cls(['nav-head-content', isSearchCentered && 'nav-head-content-search-centered'])}
          style={{
            width: '100%',
            // Top nav spans the doc-page width so its logo lines up with the sidebar (same width on landing).
            maxWidth: bodyMaxWidth,
            margin: 'auto',
            height: 'var(--nav-head-height)',
            fontSize: `min(14.2px, ${isProjectNameShort(name) ? '4.8cqw' : '4.5cqw'})`,
            color: 'var(--dp-color-muted)',
          }}
        >
          {!hideNavHeadLogo && <NavHeadLogo />}
          {navMaxWidth && !isSearchCentered && <div className="desktop-grow" />}
          {algolia && <SearchLink />}
          {/* On desktop, it's in <ExternalLinks> */}
          {darkMode && <ThemeToggle className="icon-button nav-head-theme-toggle" />}
          {docsUrl && <DocsLink href={docsUrl} />}
          {/* On desktop, the category tabs (doc pages) or the "Docs" link (landing page) replace the "Docs" menu */}
          <MenuToggleMain
            className={cls(['nav-head-menu-toggle', (hasCategoryTabs || !!docsUrl) && 'show-only-on-mobile'])}
          />
          {navHeadSecondary}
        </div>
      </div>
    </nav>
  )
}
function getStyleLayout() {
  let style = ''

  // The top bar
  style += css`
.nav-head-content {
  display: flex;
}
.nav-head-logo {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: var(--padding-side);
  color: inherit;
}
.nav-head-docs-link {
  height: 100%;
  align-items: center;
  color: inherit;
}
.nav-head-content > :is(.search-link, .nav-head-docs-link) {
  justify-content: center;
}
.nav-head-secondary {
  height: 100%;
  /* The site's own top nav links (\`topNavigation\`) don't wrap */
  white-space: nowrap;
}
/* The logo lines up with the left navigation's text (also on pages without it: the logo doesn't move between pages) */
@container container-viewport (width < ${viewDesktop}px) {
  .nav-head-logo {
    padding-left: var(--main-view-padding);
  }
}
@container container-viewport (width >= ${viewDesktop}px) {
  .nav-head-logo {
    padding-left: var(--nav-indent);
  }
}`

  // Mobile
  style += css`
@media (width <= ${viewMobile}px) {
  .nav-head-content {
    --icon-text-padding: min(8px, 1.3cqw);
    justify-content: flex-end;
  }
  /* The items share the width. With the theme toggle (four items): the logo on the left, the others grouped on the
     right, evenly spaced. */
  .nav-head-content:not(:has(> .nav-head-theme-toggle)) > * {
    flex-grow: 1;
  }
  .nav-head-content:has(> .nav-head-theme-toggle) > .nav-head-logo {
    flex-grow: 1;
  }
  .nav-head .nav-head-menu-toggle {
    justify-content: flex-end;
    padding: 0 var(--main-view-padding) 0 0;
  }
  .nav-head-theme-toggle {
    margin-inline: 6px;
  }
}
@media (width > ${viewMobile}px) {
  .nav-head-content {
    justify-content: center;
  }
  .nav-head-content > :is(.search-link, .nav-head-docs-link) {
    padding: 0 var(--padding-side);
  }
}`

  // Mobile + tablet
  style += css`
@media (width <= ${viewTablet}px) {
  .nav-head-secondary,
  .nav-head-docs-link,
  .desktop-grow,
  .text-docs,
  .caret-icon,
  .category-tabs {
    display: none;
  }
  /* The ring hugs the icon and the label (the cell is tight here) */
  .nav-head-menu-toggle:focus-visible {
    outline: none;
    .text-menu {
      outline: 2px solid var(--dp-color-primary);
      outline-offset: 4px;
      border-radius: var(--dp-radius-sm);
    }
  }
  .nav-head-theme-toggle {
    align-self: center;
    /* Same line as its neighbors */
    margin-top: 2px;
  }
}`

  // Tablet
  style += css`
@media (${viewMobile}px < width <= ${viewTablet}px) {
  .nav-head-content {
    --icon-text-padding: 8px;
    --padding-side: 20px;
  }
}`

  // Desktop small + desktop
  style += css`
@media (width > ${viewTablet}px) {
  .nav-head-content {
    --icon-text-padding: min(8px, 0.5cqw);
    --padding-side: min(20px, 1.2cqw);
  }
  .nav-head-secondary,
  .nav-head-docs-link,
  .text-docs {
    display: flex;
  }
  .text-menu,
  .nav-head .nav-head-theme-toggle,
  .show-only-on-mobile {
    display: none;
  }
  .desktop-grow,
  .has-max-width .nav-head-secondary {
    flex-grow: 1;
  }
  /* Category tabs (\`categoryTabs\`) */
  .has-category-tabs {
    --nav-tabs-height: 44px;
  }
  .nav-head-content-search-centered {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    & > .nav-head-logo {
      justify-self: start;
    }
    & > .nav-head-secondary {
      justify-self: end;
    }
  }
}`

  // The page's width. (Doc pages with the "On this page" rail: see LayoutDocsPage().)
  style += css`
@media (width <= ${viewTablet}px) {
  /* https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container/66689926#66689926 */
  .page-wrapper {
    min-width: 0;
  }
}
${
  isNavLeftAlwaysHidden()
    ? css`
@media (width > ${viewTablet}px) {
  .page-wrapper {
    min-width: ${mainViewWidthMax}px;
  }
}`
    : css`
@media (width > ${viewTablet}px) {
  @container container-viewport (width < ${viewTocRail}px) {
    .page-wrapper {
      min-width: ${mainViewWidthMax}px;
    }
  }
}`
}`

  // Desktop
  if (!isNavLeftAlwaysHidden()) {
    style += css`
@container container-viewport (width < ${viewDesktop}px) {
  #nav-left, #nav-left-margin {
    display: none;
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
}
.page-content {
  margin: auto;
}
`
}

function NavHeadLogo() {
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
          alt=""
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
    <a className="nav-head-logo" href="/" onContextMenu={!navLogo ? undefined : onContextMenu}>
      {navLogoResolved}
    </a>
  )

  function onContextMenu(ev: React.MouseEvent<unknown, MouseEvent>) {
    if (!pageContext.globalContext.config.docpress.pressKit) return // no /press page
    if (window.location.pathname === '/press') return
    ev.preventDefault()
    // @ts-ignore TODO/now Will be fixed in the next Vike version — remove this @ts-expect-error then.
    navigate('/press#logo')
  }
}
function isProjectNameShort(name: string) {
  return name.length <= 4
}

// "Docs", linking to the docs' first page (instead of opening the Docs menu), see NavHead()
function DocsLink({ href }: { href: string }) {
  return (
    <a href={href} className="colorize-on-hover nav-head-docs-link">
      <span className="text-docs">
        <DocsIcon /> Docs
      </span>
    </a>
  )
}

type PropsDiv = React.HTMLProps<HTMLDivElement>
function MenuToggleMain(props: PropsDiv) {
  return (
    <MenuToggle menuId={0} {...props}>
      <span className="text-docs">
        <DocsIcon /> Docs
      </span>
      <span className="text-menu">
        <MenuIcon /> Menu
      </span>
    </MenuToggle>
  )
}
function MenuToggle({ menuId, ...props }: PropsDiv & { menuId: number }) {
  return (
    <div
      {...props}
      className={[`colorize-on-hover menu-toggle menu-toggle-${menuId}`, props.className].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      aria-expanded={false}
      aria-controls="menu-modal-wrapper"
      onClick={(ev) => {
        ev.preventDefault()
        toggleMenuModal(menuId)
      }}
      onKeyDown={(ev) => {
        if (ev.key !== 'Enter' && ev.key !== ' ') return
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
      {props.children}
      <CaretIcon
        style={{
          width: 11,
          marginLeft: 'calc(var(--icon-text-padding) - 1px)',
          flexShrink: 0,
          color: 'var(--dp-color-subtle)',
          position: 'relative',
          top: 1,
        }}
      />
    </div>
  )
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
      alt=""
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
