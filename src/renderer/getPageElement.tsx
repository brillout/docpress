export { getPageElement }

import type { PageContext } from 'vike/types'
import type { PageContextResolved } from '../config/resolvePageContext'
import React from 'react'

function getPageElement(pageContext: PageContext, pageContextResolved: PageContextResolved) {
  const { Page } = pageContext
  const { Layout = PassThrough } = pageContext.config
  const page = (
    <Layout pageContext={pageContextResolved} pageContext2={pageContext}>
      <Page />
    </Layout>
  )
  return page
}

function PassThrough({ children }: any) {
  return <>{children}</>
}
