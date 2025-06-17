export { onRenderClient }

import React, { useEffect } from 'react'
import type { PageContextClient } from 'vike/types'
import ReactDOM from 'react-dom/client'
import { getPageElement } from './getPageElement'
import { closeMenuModal } from '../MenuModal/toggleMenuModal'
import '../css/index.css'
import { autoScrollNav } from '../autoScrollNav'
import { installSectionUrlHashs } from '../installSectionUrlHashs'
import { getGlobalObject } from '../utils/client'
import { initKeyBindings } from '../initKeyBindings'
import { initOnNavigation } from './initOnNavigation'
import { setHydrationIsFinished } from './getHydrationPromise'

const globalObject = getGlobalObject<{
  root?: ReactDOM.Root
}>('onRenderClient.ts', {})

addEcosystemStamp()
initKeyBindings()
initOnNavigation()

async function onRenderClient(pageContext: PageContextClient) {
  onRenderStart()

  let renderPromiseResolve!: () => void
  const renderPromise = new Promise<void>((r) => {
    renderPromiseResolve = r
  })
  let page = getPageElement(pageContext)
  page = <OnRenderDoneHook renderPromiseResolve={renderPromiseResolve}>{page}</OnRenderDoneHook>
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
  document.title = pageContext.pageContextResolved.documentTitle
}

function onRenderStart() {
  // It's redundant (and onLinkClick() is enough), but just to be sure.
  closeMenuModal()
}

function onRenderDone(renderPromiseResolve: () => void) {
  autoScrollNav()
  // TODO/refactor: use React?
  installSectionUrlHashs()
  setHydrationIsFinished()
  renderPromiseResolve()
}

function OnRenderDoneHook({
  renderPromiseResolve,
  children,
}: { renderPromiseResolve: () => void; children: React.ReactNode }) {
  useEffect(() => onRenderDone(renderPromiseResolve))
  return children
}

// Used by:
// - https://github.com/vikejs/vike/blob/87cca54f30b3c7e71867763d5723493d7eef37ab/vike/client/client-routing-runtime/prefetch.ts#L309-L312
function addEcosystemStamp() {
  ;(window as any)._isBrilloutDocpress = true
}
