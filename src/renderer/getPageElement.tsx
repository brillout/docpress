export { getPageElement }

import type { PageContext } from 'vike/types'
import type { PageContextResolved } from '../config/resolvePageContext'
import { PageContextProvider2 } from './usePageContext'
import React from 'react'
import { DocSearchInstall } from '../docsearch/DocSearchInstall'
import { PassThrough } from '../utils/PassTrough'

function getPageElement(pageContext: PageContext, pageContextResolved: PageContextResolved) {
  const { Page } = pageContext
  const Layout = pageContext.config.Layout || PassThrough
  const page = (
    <Wrapper {...{ pageContext }}>
      <Layout pageContext={pageContextResolved} pageContext2={pageContext}>
        <Page />
      </Layout>
      <DocSearchInstall />
    </Wrapper>
  )
  return page
}

function Wrapper({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <React.StrictMode>
      <PageContextProvider2 pageContext={pageContext}>{children}</PageContextProvider2>
    </React.StrictMode>
  )
}
