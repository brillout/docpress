export { getPageElement }

import type { PageContext } from 'vike/types'
import { PageContextProvider } from './usePageContext'
import React from 'react'
import { DocSearchInstall } from '../docsearch/DocSearchInstall'
import { Layout } from '../Layout'
// TODO: set/get custom MDXComponents via pageContext ?
import { components } from '../components/MDXComponents.js'

function getPageElement(pageContext: PageContext) {
  const { Page } = pageContext
  const page = (
    <Wrapper {...{ pageContext }}>
      <Layout>
        {/* Override default MDX element rendering by passing custom components */}
        <Page components={components} />
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
