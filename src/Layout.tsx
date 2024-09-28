export { Layout }

import React from 'react'
import { Navigation, NavigationMask } from './navigation/Navigation'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import './Layout.css'
import { NavigationFullscreenButton } from './navigation/navigation-fullscreen/NavigationFullscreenButton'
import { parseTitle } from './parseTitle'
import { usePageContext } from './renderer/usePageContext'

function Layout({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { isLandingPage, pageTitle, navigationData } = pageContext
  const pageTitleParsed = pageTitle && parseTitle(pageTitle)
  const { globalNote } = pageContext.config
  return (
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
  )
}
