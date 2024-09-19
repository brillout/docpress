import React from 'react'
import { Navigation, NavigationMask } from './navigation/Navigation'
import type { PageContextResolved } from './config/resolvePageContext'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import { PageContextProvider, PageContextProvider2 } from './renderer/usePageContext'
import './PageLayout.css'
import { NavigationFullscreenButton } from './navigation/navigation-fullscreen/NavigationFullscreenButton'
import type { PageContext } from 'vike/types'

export { PageLayout }

function PageLayout({
  pageContext,
  children,
  pageContext2,
}: { pageContext: PageContextResolved; children: React.ReactNode; pageContext2: PageContext }) {
  const { isLandingPage, pageTitle, navigationData } = pageContext
  const { globalNote } = pageContext.config
  return (
    <React.StrictMode>
      <PageContextProvider2 pageContext={pageContext2}>
      <PageContextProvider pageContext={pageContext}>
        <div className={`page-layout ${isLandingPage ? 'landing-page' : 'doc-page'}`}>
          <div id="navigation-wrapper">
            <Navigation {...pageContext.navigationData} />
          </div>
          <NavigationFullscreenButton />
          <div className="page-wrapper">
            <div className="page-container">
              <MobileHeader />
              <div className="page-content">
                {globalNote}
                {pageTitle && <h1 id={`${navigationData.currentUrl.replace('/', '')}`}>{pageTitle}</h1>}
                {children}
                {!isLandingPage && <EditPageNote pageContext={pageContext} />}
              </div>
            </div>
            <NavigationMask />
          </div>
        </div>
      </PageContextProvider>
      </PageContextProvider2>
    </React.StrictMode>
  )
}
