export { getPageElement }

import type { PageContext } from 'vike/types'
import { PageContextProvider } from './usePageContext.js'
import React from 'react'
import { DocSearchInstall } from '../docsearch/DocSearchInstall.js'
import { Layout } from '../Layout.js'

function getPageElement(pageContext: PageContext) {
  const { Page } = pageContext
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
