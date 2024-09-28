export { Layout }

import React from 'react'
import { Navigation, NavigationMask } from './navigation/Navigation'
import type { PageContextResolved } from './config/resolvePageContext'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import { PageContextProvider, PageContextProvider2 } from './renderer/usePageContext'
import './Layout.css'
import { NavigationFullscreenButton } from './navigation/navigation-fullscreen/NavigationFullscreenButton'
import type { PageContext } from 'vike/types'
import { parseTitle } from './parseTitle'

function Layout({
  pageContext,
  children,
  pageContext2,
}: { pageContext: PageContextResolved; children: React.ReactNode; pageContext2: PageContext }) {
  const { isLandingPage, pageTitle, navigationData } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
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
                  {pageTitleParsed && <h1 id={`${navigationData.currentUrl.replace('/', '')}`}>{pageTitleParsed}</h1>}
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
