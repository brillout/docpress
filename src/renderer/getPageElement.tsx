export { getPageElement }

import type { PageContext } from 'vike/types'
import type { PageContextResolved } from '../config/resolvePageContext'
import { PageContextProvider, PageContextProvider2 } from './usePageContext'
import React from 'react'

function getPageElement(pageContext: PageContext, pageContextResolved: PageContextResolved) {
  const { Page } = pageContext
  const Layout = pageContext.config.Layout || PassThrough
  const page = (
    <React.StrictMode>
      <PageContextProvider2 pageContext={pageContext}>
        <PageContextProvider pageContext={pageContextResolved}>
          <Layout pageContext={pageContextResolved} pageContext2={pageContext}>
            <Page />
          </Layout>
        </PageContextProvider>
      </PageContextProvider2>
    </React.StrictMode>
  )
  return page
}

function PassThrough({ children }: any) {
  return <>{children}</>
}
