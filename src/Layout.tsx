export { Layout }

import React from 'react'
import { Navigation, NavigationMask } from './navigation/Navigation'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import './Layout.css'
import { parseTitle } from './parseTitle'
import { usePageContext, usePageContext2 } from './renderer/usePageContext'
import { Links } from './navigation/NavigationHeader'
import { hotkeyLabel } from './navigation/navigation-fullscreen/hotkeyLabel'
import { toggleMenu } from './navigation/navigation-fullscreen/initNavigationFullscreen'
import { menuUrl } from './navigation/navigation-fullscreen/menuUrl'

function Layout({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const pageContext2 = usePageContext2()
  const { isLandingPage, pageTitle, navigationData, noSideNavigation, topNavigationList, topNavigationStyle } =
    pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  const { NavHeader } = pageContext2.config.NavHeader!
  return (
    <>
      {noSideNavigation && (
        <div
          id="top-navigation"
          style={{
            position: 'relative',
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            justifyContent: noSideNavigation === 'no-logo' ? 'center' : 'space-between',
            textDecoration: 'none',
            marginBottom: 'var(--block-margin)',
            backgroundColor: 'var(--bg-color)',
            ...topNavigationStyle,
          }}
        >
          {noSideNavigation !== 'no-logo' && (
            <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
              <NavHeader />
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TopNavigationLink
              href={menuUrl}
              onClick={(ev) => {
                ev.preventDefault()
                toggleMenu()
              }}
              aria-label={hotkeyLabel}
              data-balloon-pos="left"
              data-balloon-blunt
            >
              Documentation
            </TopNavigationLink>
            {topNavigationList.map(({ title, url }) => (
              <TopNavigationLink href={url!} key={url}>
                {title}
              </TopNavigationLink>
            ))}
            <Links style={{ display: 'inline-flex', marginLeft: 5 }} />
          </div>
        </div>
      )}
      <div
        className={['page-layout', isLandingPage ? 'landing-page' : 'doc-page', noSideNavigation && 'noSideNavigation']
          .filter(Boolean)
          .join(' ')}
      >
        <div id="navigation-wrapper">
          <Navigation {...pageContext.navigationData} />
        </div>
        <div className="page-wrapper">
          <div className="page-container">
            <MobileHeader />
            <div className="page-content">
              {globalNote}
              {pageTitleParsed && <h1 id={`${navigationData.currentUrl.replace('/', '')}`}>{pageTitleParsed}</h1>}
              {children}
              {!isLandingPage && <EditPageNote pageContext={pageContext} />}
            </div>
          </div>
          <NavigationMask />
        </div>
      </div>
    </>
  )
}

function TopNavigationLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      style={{
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 10px',
        cursor: 'pointer',
        color: '#666',
        fontSize: '1.06em',
      }}
      {...props}
    />
  )
}
