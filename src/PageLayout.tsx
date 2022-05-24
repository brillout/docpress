import React from 'react'
import { Navigation } from './Navigation'
import type { Heading, PageContextOriginal } from './processPageContext'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './EditPageNote'
import { PageContextProvider } from './renderer/usePageContext'
import './PageLayout.css'

export { PageLayout }

function PageLayout({
  pageContext,
  children,
}: {
  pageContext: PageContextOriginal & {
    headingsWithSubHeadings: Heading[]
    pageTitle: string | JSX.Element | null
    isLandingPage: boolean
    isDetachedPage: boolean
  }
  children: JSX.Element
}) {
  const { isLandingPage, pageTitle } = pageContext
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
          className={isLandingPage ? 'landing-page' : 'doc-page'}
        >
          <div id="navigation-wrapper">
            <Navigation pageContext={pageContext} />
          </div>
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
