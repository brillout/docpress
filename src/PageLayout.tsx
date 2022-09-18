import React from 'react'
import { Navigation } from './navigation/Navigation'
import type { PageContextResolved } from './config/resolvePageContext'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import { PageContextProvider } from './renderer/usePageContext'
import './PageLayout.css'

export { PageLayout }

function PageLayout({ pageContext, children }: { pageContext: PageContextResolved; children: JSX.Element }) {
  const { isLandingPage, pageTitle } = pageContext
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
          className={isLandingPage ? 'landing-page' : 'doc-page'}
        >
          <div id="navigation-wrapper">
            <Navigation pageContext={pageContext} />
          </div>
          <div id="navigation-expend-button"><div><div></div></div></div>
          <div id="page-wrapper">
            <div id="page-container">
              <MobileHeader />
              <div id="page-content">
                {pageTitle && <h1>{pageTitle}</h1>}
                {children}
                {!isLandingPage && <EditPageNote pageContext={pageContext} />}
              </div>
            </div>
          </div>
        </div>
      </PageContextProvider>
    </React.StrictMode>
  )
}
