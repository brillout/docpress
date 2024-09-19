export { getPageElement }

import type { PageContext } from 'vike/types'
import type { PageContextResolved } from '../config/resolvePageContext'
import { PageLayout } from '../PageLayout'
import React from 'react'

function getPageElement(pageContext: PageContext, pageContextResolved: PageContextResolved) {
  const { Page } = pageContext
  const page = (
    <PageLayout pageContext={pageContextResolved}>
      <Page />
    </PageLayout>
  )
  return page
}
