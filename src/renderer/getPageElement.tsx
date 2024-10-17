export { getPageElement }

import type { PageContext } from 'vike/types'
import type { PageContextResolved } from '../config/resolvePageContext'
import { PageContextProvider, PageContextProvider2 } from './usePageContext'
import React from 'react'
import { DocSearchInstall } from '../docsearch/DocSearchInstall'

function getPageElement(pageContext: PageContext, pageContextResolved: PageContextResolved) {
  const { Page } = pageContext
  const Layout = pageContext.config.Layout || PassThrough
  const page = (
    <Wrapper {...{ pageContext, pageContextResolved }}>
      <Layout pageContext={pageContextResolved} pageContext2={pageContext}>
        <Page />
      </Layout>
      <DocSearchInstall />
    </Wrapper>
  )
  return page
}

function Wrapper({
  children,
  pageContext,
  pageContextResolved,
}: { children: React.ReactNode; pageContext: PageContext; pageContextResolved: PageContextResolved }) {
  return (
    <React.StrictMode>
      <PageContextProvider2 pageContext={pageContext}>
        <PageContextProvider pageContext={pageContextResolved}>{children}</PageContextProvider>
      </PageContextProvider2>
    </React.StrictMode>
  )
}

function PassThrough({ children }: any) {
  return <>{children}</>
}
