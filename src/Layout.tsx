export { Layout }

import React from 'react'
import { Navigation, NavigationMask } from './navigation/Navigation'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import './Layout.css'
import { NavigationFullscreenButton } from './navigation/navigation-fullscreen/NavigationFullscreenButton'
import { parseTitle } from './parseTitle'
import { usePageContext, usePageContext2 } from './renderer/usePageContext'
import { Links } from './navigation/NavigationHeader'

function Layout({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const pageContext2 = usePageContext2()
  const { isLandingPage, pageTitle, navigationData, noSideNavigation } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  const { NavHeader } = pageContext2.config.NavHeader!
  return (
    <>
      {noSideNavigation && (
        <div
          id="navtop"
          style={{
            position: 'relative',
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            maxWidth: 1280,
            margin: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NavHeader />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a
              id="doclink"
              style={{
                // background: 'red',
                height: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 20px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '1.06em',
              }}
            >
              Documentation
            </a>
            <Links style={{ display: 'inline-flex' }} />
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
        <NavigationFullscreenButton />
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
