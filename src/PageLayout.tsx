import React from 'react'
import { Navigation } from './navigation/Navigation'
import type { PageContextResolved } from './config/resolvePageContext'
import { MobileHeader } from './MobileHeader'
import { EditPageNote } from './components/EditPageNote'
import { PageContextProvider } from './renderer/usePageContext'
import './PageLayout.css'
import 'balloon-css'
import closeIcon from './navigation/close.svg'

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
          <NavigationExpendButton />
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

function NavigationExpendButton() {
  return (
    <a id="navigation-expend-button">
      <div
        style={{
          position: 'fixed',
          cursor: 'pointer',
          height: '100vh',
          width: 20,
          overflow: 'hidden'
        }}
      >
        <div></div>
      </div>
      <div
        style={{ position: 'fixed', height: '100vh', width: 20 }}
        aria-label="Press <Esc>"
        data-balloon-pos="right"
      ></div>
      <a
        id="navigation-expend-close-button"
        style={{ position: 'fixed', top: 11, right: 15, zIndex: 10 }}
        aria-label="Press <Esc>"
        data-balloon-pos="left"
      >
        <img src={closeIcon} height={50} width={50} style={{ display: 'block' }} />
      </a>
    </a>
  )
}
