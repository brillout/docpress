export { Layout }
export { containerQueryMobile }
export { navWidthMin }
export { navWidthMax }

import React from 'react'
import { NavigationContent } from './navigation/Navigation'
import { EditPageNote } from './components/EditPageNote'
import { parseTitle } from './parseTitle'
import { usePageContext, usePageContext2 } from './renderer/usePageContext'
import { NavLinks } from './NavLinks'
import { closeMenuModal, openMenuModal, toggleMenuModal } from './MenuModal'
import { MenuModal } from './MenuModal'
import { autoScrollNav_SSR } from './autoScrollNav'
import { SearchLink } from './docsearch/SearchLink'
import { navigate } from 'vike/client/router'
import { css } from './utils/css'
import { PassThrough } from './utils/PassTrough'

const mainViewWidthMax = 800
const mainViewPadding = 20
// TODO/refactor: rename
const navWidthMax = 370
const navWidthMin = 300
const blockMargin = 3
const mainViewMax = mainViewWidthMax + mainViewPadding * 2
const containerQuerySpacing = mainViewMax + navWidthMax + blockMargin
const containerQueryMobile = mainViewMax + navWidthMin

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
          containerType: 'inline-size',
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
#menu-modal {
  position: absolute !important;
}
`
    if (!hideNavLeftAlways) {
      navLeftHide = css`
@container(max-width: ${containerQueryMobile - 1}px) {
  ${navLeftHide}
}
@container(min-width: ${containerQueryMobile}px) {
  #nav-header-top {
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
                minWidth: navWidthMin,
                maxWidth: navWidthMax,
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
  const { projectName } = pageContext.meta
  const { isLandingPage } = pageContext
  const childrenStyle: React.CSSProperties = {
    justifyContent: 'center',
    fontSize: `min(16.96px, ${isProjectNameShort(projectName) ? '4.8cqw' : '4.5cqw'})`,
    ['--icon-text-padding']: 'min(8px, 1.8cqw)',
    height: '100%',
    padding: '0 var(--padding-side)',
  }
  const pageContext2 = usePageContext2()
  const TopNavigation = pageContext2.config.TopNavigation || PassThrough
  return (
    <div
      id={isNavLeft ? undefined : 'nav-header-top'}
      className="link-hover-animation nav-header"
      style={{
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        justifyContent: isNavLeft ? 'flex-end' : 'center',
        borderBottom: 'var(--block-margin) solid white',
        color: '#666',
      }}
    >
      <div
        className="nav-header-container"
        style={{
          display: 'flex',
          height: 'var(--top-nav-height)',
          containerType: 'inline-size',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minWidth: isNavLeft && navWidthMin,
          maxWidth: isNavLeft && navWidthMax,
        }}
      >
        {!isLandingPage && <NavLogo className="nav-logo" iconSize={39} paddingLeft={5} style={childrenStyle} />}
        <div className="top-links" style={{ ...childrenStyle, padding: 0 }}>
          <TopNavigation />
        </div>
        <SearchLink
          className="search-link"
          style={{
            //
            ...childrenStyle,
          }}
        />
        <MenuLink
          className="menu-link"
          style={{
            //
            ...childrenStyle,
          }}
        />
        <NavLinks
          className="nav-links"
          style={{
            display: 'inline-flex',
            marginLeft: -8,
            fontSize: '1.06em',
            padding: '0 var(--padding-side)',
          }}
        />
      </div>
      <Style>{css`
@container(max-width: 500px) {
  .menu-link {
    flex-grow: 1;
  }
  .search-link,
  .nav-logo {
    flex-grow: 0.5;
  }
}
.nav-header-container > * {
  --padding-side: 0px;
}
@container(min-width: 501px) {
  .nav-header-container > * {
    --padding-side: 35px;
  }
}
@container(max-width: 950px) {
  .nav-links,
  .top-links {
    display: none !important;
  }
}

        `}</Style>
    </div>
  )
}

function NavLogo({
  iconSize,
  paddingLeft,
  ...props
}: { iconSize: number; paddingLeft: number; style?: React.CSSProperties; id?: string; className?: string }) {
  const marginLeft = -10
  const pageContext = usePageContext()
  const { projectName } = pageContext.meta
  return (
    <a
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        color: 'inherit',
        height: '100%',
        ...props.style,
        paddingLeft: paddingLeft + marginLeft * -1,
        marginLeft: marginLeft,
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
      <DocsIcon />
      Docs
    </div>
  )
}
function DocsIcon() {
  return (
    <span
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)', lineHeight: 0, width: '1.3em' }}
      className="decolorize-6"
    >
      📚
    </span>
  )
}
/* TODO/now: use for mobile
function MenuIcon() {
  return (
    <svg
      style={{ marginRight: 'calc(var(--icon-text-padding) + 2px)', lineHeight: 0, width: '1.3em' }}
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
*/

function Style({ children }: { children: string }) {
  return <style dangerouslySetInnerHTML={{ __html: children }} />
}
