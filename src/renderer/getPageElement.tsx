export { getPageElement }

import type { PageContext } from 'vike/types'
import { PageContextProvider } from './usePageContext'
import React from 'react'
import { DocSearchInstall } from '../docsearch/DocSearchInstall'
import { PassThrough } from '../utils/PassTrough'

function getPageElement(pageContext: PageContext) {
  const { Page } = pageContext
  const Layout = pageContext.config.Layout || PassThrough
  const page = (
    <Wrapper {...{ pageContext }}>
      <Layout>
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
      <PageContextProvider pageContext={pageContext}>{children}</PageContextProvider>
    </React.StrictMode>
  )
}
