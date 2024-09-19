export { onRenderClient }

import React from 'react'
import type { PageContextClient } from 'vike/types'
import ReactDOM from 'react-dom/client'
import { PageContextResolved } from '../config/resolvePageContext'
import { getPageElement } from './getPageElement'

let root: ReactDOM.Root
function onRenderClient(pageContext: PageContextClient) {
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved
  const page = getPageElement(pageContext, pageContextResolved)
  const container = document.getElementById('page-view')!
  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page)
  } else {
    if (!root) {
      root = ReactDOM.createRoot(container)
    }
    root.render(page)
  }
}
