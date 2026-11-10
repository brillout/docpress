export { Layout }
export { MenuToggle }
export { viewDesktop }
export { viewTablet }
export { viewMobile }
export { navLeftWidthMin }
export { navLeftWidthMax }
export { bodyMaxWidth }
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
import { css } from './utils/css.js'
import { Style } from './utils/Style.js'
import { cls } from './utils/cls.js'
import { iconBooks } from './icons/index.js'
import { PageHeader, PageFooter } from './PageChrome.js'
import { TocRail, tocRailWidthMin, viewTocRail } from './TocRail.js'
import { CategoryTabs, NavHeadCategory } from './CategoryTabs.js'
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
// From this viewport height there's room to keep the sticky top nav whole: below it, a scroll down hides the category tabs
const viewHeightHeaderStays = 900
// From this viewport height there's room to keep the top bar: below it, a scroll down hides the whole top nav (a 1366x768 laptop, a phone held sideways)
const viewHeightTopBarStays = 700
// A desktop bar narrower than this has the search as an icon, unless the search is centered (the bar has no `topNavigation` links, the full field fits): a bar with four `topNavigation` items ("API", "Get Started", "Blog", "Pricing"), the "Docs" toggle and the full search field needs 1150px (measured with Inter)
const viewSearchField = 1150
// Up to this, the search field squeezes "Menu": with a fine pointer's keyboard hint (in the phone bar up to 386px, and in the tablet bar up to 457px), and in the tablet bar beside a touch device's larger theme toggle (up to 459px, and 463px with the fallback font before Inter loads): the search is compact
const viewSearchHint = 463
const viewDesktop = (mainViewWidthMax + navLeftWidthMin + blockMargin) as 1061 // 1061 = 760 + 300 + 1
const viewDesktopLarge = (mainViewWidthMax + navLeftWidthMax + blockMargin) as 1131 // 1131 = 760 + 370 + 1
// The frame: left navigation + page content + "On this page", and not wider (the eye doesn't travel far)
const bodyMaxWidth = 1340
// A bar (the top nav, the category tabs): copies of the bar left and right of it, so that it spans the viewport also
// beyond `bodyMaxWidth`
const barShadowSides = `-${bodyMaxWidth}px 0 0 var(--dp-color-bg), ${bodyMaxWidth}px 0 0 var(--dp-color-bg)`
// ... and the bottom hairline
const barShadow = [
  `0 ${blockMargin}px 0 var(--dp-color-border)`,
  barShadowSides,
  `-${bodyMaxWidth}px ${blockMargin}px 0 var(--dp-color-border)`,
  `${bodyMaxWidth}px ${blockMargin}px 0 var(--dp-color-border)`,
].join(', ')

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
  const { isLandingPage, pageDesign, navItemsDetached } = pageContext.resolved
  const isTopNavSticky = !isLandingPage && (pageDesign?.topNavSticky ?? true)
  const isNavLeftAlwaysHidden =
    isLandingPage || !!pageDesign?.hideMenuLeft || !!(navItemsDetached && navItemsDetached.length <= 1)

  const content = isLandingPage ? (
    <PageContent>{children}</PageContent>
  ) : (
    <LayoutDocsPage isNavLeftAlwaysHidden={isNavLeftAlwaysHidden}>{children}</LayoutDocsPage>
  )

  // user decision 2026-10-30: the two-row header is the only design
  // The second row: the categories as tabs (doc pages, desktop), for a site with more than one category
  const hasSeveralCategories = pageContext.resolved.categories.length > 1
  const isCategoryTabsShown = hasSeveralCategories && !isLandingPage
  return (
    <div
      className={isCategoryTabsShown ? 'has-category-tabs' : undefined}
      style={{
        ['--block-margin']: `${blockMargin}px`,
        ['--nav-head-height']: `${navHeadHeight}px`,
        // Offset for jumps and focus below the sticky top nav, clear of the rows that scrolling up brings back
        ['--nav-head-sticky-offset']: isTopNavSticky
          ? 'calc(var(--nav-head-height) + var(--nav-tabs-height, 0px))'
          : '0px',
        // The sticky top nav's shown height, without what's hidden (TocRail.tsx measures from it)
        ['--nav-head-shown-height']: isTopNavSticky
          ? 'calc(var(--nav-head-height) + var(--nav-tabs-shown-height, 0px))'
          : '0px',
        ['--main-view-padding']: `${mainViewPadding}px`,
        // We don't add `container` to `body` nor `html` beacuse in Firefox it breaks the `position: fixed` of <MenuModal>
        // https://stackoverflow.com/questions/74601420/css-container-inline-size-and-fixed-child
        container: 'container-viewport / inline-size',
        maxWidth: isNavLeftAlwaysHidden ? undefined : bodyMaxWidth,
        margin: 'auto',
      }}
    >
      {/* Before the markup it styles: the first paint has the right layout */}
      <Style>{getStyleLayout(isNavLeftAlwaysHidden)}</Style>
      {/* Focused elements aren't hidden under the sticky top nav (its own don't scroll; for headings, see heading.css) */}
      {isTopNavSticky && (
        <Style>{css`
:where(a, button, input, select, textarea, summary, [tabindex]):where(:not(.doc-page > header *)):focus {
  scroll-margin-top: calc(var(--nav-head-sticky-offset) + 16px);
}`}</Style>
      )}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className={isLandingPage ? 'landing-page' : 'doc-page'} style={whitespaceBuster1}>
        <header
          className={isTopNavSticky ? 'top-nav-sticky' : undefined}
          style={{ position: isTopNavSticky ? 'sticky' : 'relative', top: 0, zIndex: 100 }}
        >
          <NavHead
            hasSeveralCategories={hasSeveralCategories}
            hasCategoryInBar={isCategoryTabsShown && isTopNavSticky}
          />
          {isCategoryTabsShown && <CategoryTabs />}
          {/* <MenuModal> is inside here because `container-type` on the page wrapper traps `position: fixed` — https://github.com/brillout/docpress/pull/177 */}
          <MenuModal />
        </header>
        {content}
      </div>
      {/* Early toggling, to avoid layout jumps */}
      <script dangerouslySetInnerHTML={{ __html: `${initializeChoiceGroup_SSR}` }}></script>
    </div>
  )
}

function LayoutDocsPage({
  children,
  isNavLeftAlwaysHidden,
}: { children: React.ReactNode; isNavLeftAlwaysHidden: boolean }) {
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
  isNavLeftAlwaysHidden
    ? ''
    : css`
@container container-viewport (width < ${viewTocRail}px) {
  #toc-rail {
    display: none;
  }
}
@container container-viewport (width >= ${viewTocRail}px) {
  /* The left navigation and the rail share the width the content leaves equally: the content is in the middle */
  #nav-left, #toc-rail {
    flex: 1 1 0;
    min-width: ${tocRailWidthMin}px;
  }
  /* As wide as the left navigation's hairline (a flex item never shrinks below its border) */
  #toc-rail {
    border-left: var(--block-margin) solid transparent;
  }
  /* The page content gives up some width to the rail */
  .page-wrapper {
    flex: 0 1 auto;
    min-width: ${mainViewWidthMax - 120}px;
  }
  /* The rail lists the page's sections: don't also expand them in the left navigation */
  #nav-left .nav-item-level-3 {
    display: none;
  }
  #nav-left-margin {
    display: none;
  }
}
@container container-viewport (${viewTocRail}px <= width < ${viewTocRail + 120}px) {
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
  /* Its column stays, empty: the content stays in the middle */
  #nav-left {
    visibility: hidden;
  }
  ${getStyleNavLeftHidden()}
  .page-wrapper {
    flex-grow: 0;
  }
}`
}
`}</Style>
      <div style={{ display: 'flex', ...whitespaceBuster2 }}>
        {!isNavLeftAlwaysHidden && (
          <>
            <NavLeft />
            <div id="nav-left-margin" className="low-prio-grow" style={{ width: 0, maxWidth: 50 }} />
          </>
        )}
        {/* Before the page content in the HTML (it's parsed and painted with the first chunk: the content doesn't
            shift when it arrives), after it on the screen (flex order, TocRail.css) */}
        {!isNavLeftAlwaysHidden && <TocRail />}
        <PageContent>{children}</PageContent>
      </div>
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
            // Sit below the sticky top nav and its category tabs, also while they're hidden (or at the very top when
            // the top nav isn't sticky)
            top: 'var(--nav-head-sticky-offset)',
          }}
        >
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
            }}
          >
            {navItemsDetached ? (
              <NavigationContent navItems={navItemsDetached} />
            ) : (
              <NavigationContent navItems={navItemsAll} showOnlyRelevant={true} />
            )}
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

  const navItemsRelevant = props.showOnlyRelevant
    ? navItemsWithComputed.filter((navItemGroup) => navItemGroup.isRelevant)
    : navItemsWithComputed

  return (
    <div className="navigation-content" style={{ marginTop: 10 }}>
      {navItemsRelevant.map((navItem, i) => (
        <NavItemComponent navItem={navItem} key={i} />
      ))}
    </div>
  )
}

function NavHead({
  hasSeveralCategories,
  hasCategoryInBar,
}: { hasSeveralCategories: boolean; hasCategoryInBar: boolean }) {
  const pageContext = usePageContext()
  const {
    navMaxWidth,
    name,
    algolia,
    darkMode,
    docsUrl: docsUrlSetting,
    topNavigation,
  } = pageContext.globalContext.config.docpress
  const { isLandingPage } = pageContext.resolved
  const hideNavHeadLogo = isLandingPage && !navMaxWidth
  // With category tabs, the landing page's "Docs" is a link into the docs, where the tabs take over (on desktop)
  const docsUrl =
    hasSeveralCategories && isLandingPage
      ? (docsUrlSetting ?? pageContext.resolved.categories.flatMap((category) => category.pages)[0]?.url)
      : undefined
  // The category tabs without `topNavigation`: the search centered in the bar, "Docs" next to it on the landing page
  // (the search doesn't move between the landing page and the docs)
  const isSearchCentered = !!navMaxWidth && hasSeveralCategories && !topNavigation && !!algolia

  const navHeadSecondary = (
    <div className="nav-head-secondary">
      {topNavigation}
      {navMaxWidth && <div className="desktop-grow" />}
      <ExternalLinks
        atRightEdge
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
          {hasCategoryInBar ? (
            // One cell (also of the search-centered bar's grid): the category comes after the logo
            <div className="nav-head-start">
              <NavHeadLogo />
              <NavHeadCategory />
            </div>
          ) : (
            !hideNavHeadLogo && <NavHeadLogo />
          )}
          {navMaxWidth && !isSearchCentered && <div className="desktop-grow" />}
          {algolia && <SearchLink />}
          {/* On desktop, it's in <ExternalLinks> */}
          {darkMode && <ThemeToggle className="icon-button nav-head-theme-toggle" />}
          {docsUrl && <DocsLink href={docsUrl} />}
          {/* On desktop, the "Docs" link (landing page) or the category tabs (doc pages, beside the left navigation, see
              getStyleLayout()) replace the "Docs" menu */}
          <MenuToggleMain className={cls(['nav-head-menu-toggle', docsUrl && 'show-only-on-mobile'])} />
          {navHeadSecondary}
        </div>
      </div>
    </nav>
  )
}
function getStyleLayout(isNavLeftAlwaysHidden: boolean) {
  let style = ''

  // The top bar
  style += css`
.nav-head {
  box-shadow: ${barShadow};
}
.nav-head-content {
  display: flex;
}
.nav-head-start {
  display: flex;
  height: 100%;
}
.nav-head-logo {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: var(--nav-head-indent);
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
/* The logo and the first category tab's icon line up with the left navigation's text (also on pages without it: the
   logo doesn't move between pages) */
@container container-viewport (width < ${viewDesktop}px) {
  :is(.doc-page, .landing-page) {
    --nav-head-indent: var(--main-view-padding);
  }
}
@container container-viewport (width >= ${viewDesktop}px) {
  :is(.doc-page, .landing-page) {
    --nav-head-indent: var(--nav-indent);
  }
}`

  // A viewport without room for the sticky top nav: a scroll down hides the category tabs, or on a short one the whole
  // top nav (initScrollDirection.ts)
  style += css`
.top-nav-sticky > :is(.nav-head, .category-tabs) {
  transition: transform var(--dp-duration-reveal) var(--dp-ease-out);
}
@media (${viewHeightTopBarStays}px <= height < ${viewHeightHeaderStays}px) {
  /* The tabs slide under the top bar, which names the category (<NavHeadCategory>), unless they have the keyboard
     focus. The bar's category keeps them there while it has it. */
  html:is(.scrolled-down, :has(.nav-head-category:focus-visible)):not(:has(.category-tabs a:focus-visible)) {
    .has-category-tabs {
      --nav-tabs-shown-height: 0px;
    }
    .top-nav-sticky {
      /* The strip the tabs leave lets the pointer through to the page */
      pointer-events: none;
      & > * {
        pointer-events: auto;
      }
      .category-tabs {
        transform: translateY(-100%);
      }
      .category-tabs-content {
        opacity: 0;
      }
      .nav-head-category {
        opacity: 1;
        visibility: visible;
      }
    }
  }
}
@media (height < ${viewHeightTopBarStays}px) {
  /* Shown at once when focus enters: mid-transition, the browser would scroll the page to the off-screen element */
  .top-nav-sticky:has(:focus-visible) > :is(.nav-head, .category-tabs) {
    transition: none;
  }
  html.scrolled-down:not(.menu-modal-show) .top-nav-sticky:not(:has(:focus-visible)) {
    /* The header's box stays in the flow: the strip it leaves lets the pointer through */
    pointer-events: none;
    & > :is(.nav-head, .category-tabs) {
      /* Including the hairline below the last row */
      transform: translateY(calc(-1 * (var(--nav-head-sticky-offset) + var(--block-margin))));
    }
    & ~ * {
      --nav-head-shown-height: 0px;
    }
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
  .nav-head-content:has(> .nav-head-theme-toggle) > :is(.nav-head-logo, .nav-head-start) {
    flex-grow: 1;
  }
  /* The logo's link takes its cell (the category after it shows only on desktop) */
  .nav-head-start > .nav-head-logo {
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
  .category-tabs,
  .nav-head-category {
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

  // The compact search: phones and the narrow desktop bar. By the bar's width (@container: without a classic scrollbar).
  style += css`
@container container-viewport (width <= ${viewSearchHint}px) {
  .nav-head-content .search-box {
    padding: 0 10px;
  }
  .nav-head-content .search-box-kbd {
    display: none;
  }
}
/* The tablet bar has no room for the field's width: the search hugs its label */
@media (width > ${viewMobile}px) {
  @container container-viewport (width <= ${viewSearchHint}px) {
    .nav-head-content .search-box {
      min-width: 0;
    }
  }
}
/* The icon alone: narrow phones (the top nav also holds the logo, the theme toggle and the menu) */
@container container-viewport (width <= 400px) {
  .nav-head-content .search-box {
    min-width: 0;
  }
  .nav-head-content .search-box-text {
    display: none;
  }
}
/* The narrow desktop bar: the icon alone (not the search-centered bar) */
@media (width > ${viewTablet}px) {
  @container container-viewport (width < ${viewSearchField}px) {
    .nav-head-content:not(.nav-head-content-search-centered) .search-box {
      min-width: 0;
      padding: 0 10px;
    }
    .nav-head-content:not(.nav-head-content-search-centered) .search-box-kbd,
    .nav-head-content:not(.nav-head-content-search-centered) .search-box-text {
      display: none;
    }
  }
}`

  // Desktop small + desktop
  style += css`
@media (width > ${viewTablet}px) {
  .nav-head-content {
    --icon-text-padding: min(8px, 0.5cqw);
  }
  /* Tighter gaps in the narrow desktop bar (with 1.2cqw gaps, the touch bar with the "Docs" link needs 1028px on the
     landing page, and the desktop bar starts at 1002px beside a classic scrollbar) */
  @container container-viewport (width < ${viewSearchField}px) {
    .nav-head-content {
      --padding-side: 9px;
    }
  }
  @container container-viewport (width >= ${viewSearchField}px) {
    .nav-head-content {
      --padding-side: min(20px, 1.2cqw);
    }
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
  /* A menu's toggle while its menu is open */
  .menu-toggle[aria-expanded='true'] {
    color: var(--dp-color-text);
    [class^='decolorize-'],
    [class*=' decolorize-'] {
      filter: grayscale(0) opacity(1);
    }
    &::before {
      clip-path: inset(0);
    }
    & .caret-icon-left {
      transform: rotate(-90deg);
    }
    & .caret-icon-right {
      transform: rotate(90deg);
    }
  }
  .desktop-grow,
  .has-max-width .nav-head-secondary {
    flex-grow: 1;
  }
  /* Category tabs (CategoryTabs.tsx) */
  .has-category-tabs {
    --nav-tabs-height: 44px;
    /* The tabs have the hairline, also when they slide up under the bar */
    .nav-head {
      box-shadow: ${barShadowSides};
    }
    /* The left navigation lists the category's pages (where it's hidden, see getStyleNavLeftHidden()) */
    .nav-head-menu-toggle {
      display: none;
    }
  }
  .nav-head-content-search-centered {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    & > .nav-head-logo {
      justify-self: start;
    }
    /* "Docs" and the links share the last cell */
    & > :is(.nav-head-docs-link, .nav-head-menu-toggle) {
      grid-area: 1 / 3;
      justify-self: start;
    }
    & > .nav-head-secondary {
      grid-area: 1 / 3;
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
  isNavLeftAlwaysHidden
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
  if (!isNavLeftAlwaysHidden) {
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
/* The "Docs" menu, also beside the category tabs */
.has-category-tabs .nav-head-menu-toggle {
  display: flex;
}
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
    // Imported lazily: a static import closes a chunk cycle through vike's navigate.ts -> initClientRouter import
    import('vike/client/router').then(({ navigate }) => {
      navigate('/press#logo')
    })
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
  const widths = [18, 11, 14]
  return (
    <div style={{ display: 'inline-block', position: 'relative', top: 2, marginRight: 3, direction: 'rtl' }}>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            style={{
              background: 'currentColor',
              width: widths[i],
              height: 2,
              opacity: '0.8',
              marginTop: i === 0 ? 0 : 4,
            }}
          />
        ))}
    </div>
  )
}
