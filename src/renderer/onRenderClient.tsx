export { onRenderClient }

import React, { useEffect } from 'react'
import type { PageContextClient } from 'vike/types'
import ReactDOM from 'react-dom/client'
import { PageContextResolved } from '../config/resolvePageContext'
import { getPageElement } from './getPageElement'
import { closeMenuModal } from '../MenuModal'
import '../css/index.css'
import { autoScrollNav } from '../autoScrollNav'
import { installSectionUrlHashs } from '../installSectionUrlHashs'
import { getGlobalObject } from '../utils/client'
import { initKeyBindings } from '../initKeyBindings'
import { initOnNavigation } from './initOnNavigation'
import { cssStopDedupe } from '../utils/css'

const globalObject = getGlobalObject<{
  root?: ReactDOM.Root
  renderPromiseResolve?: () => void
}>('onRenderClient.ts', {})

addEcosystemStamp()
initKeyBindings()
initOnNavigation()

async function onRenderClient(pageContext: PageContextClient) {
  onRenderStart()

  // TODO: stop using any
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved
  const renderPromise = new Promise<void>((r) => {
    globalObject.renderPromiseResolve = r
  })
  let page = getPageElement(pageContext, pageContextResolved)
  page = <OnRenderDoneHook>{page}</OnRenderDoneHook>
  const container = document.getElementById('page-view')!
  if (pageContext.isHydration) {
    globalObject.root = ReactDOM.hydrateRoot(container, page)
  } else {
    if (!globalObject.root) {
      globalObject.root = ReactDOM.createRoot(container)
    }
    globalObject.root.render(page)
  }
  if (!pageContext.isHydration) {
    applyHead(pageContext)
  }
  await renderPromise
}

function applyHead(pageContext: PageContextClient) {
  // TODO: stop using any
  const pageContextResolved: PageContextResolved = (pageContext as any).pageContextResolved
  document.title = pageContextResolved.documentTitle
}

function onRenderStart() {
  // It's redundant (and onLinkClick() is enough), but just to be sure.
  closeMenuModal()
}

function onRenderDone() {
  autoScrollNav()
  // TODO/refactor: use React?
  installSectionUrlHashs()
  setHydrationIsFinished()
  cssStopDedupe()
  globalObject.renderPromiseResolve!()
}

function OnRenderDoneHook({ children }: { children: React.ReactNode }) {
  useEffect(onRenderDone)
  return children
}

function setHydrationIsFinished() {
  // Used by:
  // - https://github.com/vikejs/vike/blob/9d67f3dd4bdfb38c835186b8147251e0e3b06657/docs/.testRun.ts#L22
  // - https://github.com/brillout/telefunc/blob/57c942c15b7795cfda96b5106acc9e098aa509aa/docs/.testRun.ts#L26
  ;(window as any).__docpress_hydrationFinished = true
}

// Used by:
// - https://github.com/vikejs/vike/blob/87cca54f30b3c7e71867763d5723493d7eef37ab/vike/client/client-routing-runtime/prefetch.ts#L309-L312
function addEcosystemStamp() {
  ;(window as any)._isBrilloutDocpress = true
}
