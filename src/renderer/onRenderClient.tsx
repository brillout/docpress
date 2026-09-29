export { onRenderClient }

import React, { useEffect } from 'react'
import type { PageContextClient } from 'vike/types'
import ReactDOM from 'react-dom/client'
import { getPageElement } from './getPageElement.js'
import { closeMenuModal, initMenuModalCloseListeners } from '../MenuModal/toggleMenuModal.js'
import '../css/index.css'
import { autoScrollNav } from '../autoScrollNav.js'
import { installSectionUrlHashs } from '../installSectionUrlHashs.js'
import { getGlobalObject } from '../utils/client.js'
import { initKeyBindings, initInputModality } from '../initKeyBindings.js'
import { initOnNavigation } from './initOnNavigation.js'
import { setHydrationIsFinished } from './getHydrationPromise.js'
import { addScript } from '../utils/addScript.js'
import { initThemeListener } from '../theme/applyTheme.js'
import { initDocsearchFocusReturn } from '../docsearch/toggleDocsearchModal.js'
import { initTooltipGroup } from '../tooltips.js'

const globalObject = getGlobalObject<{
  root?: ReactDOM.Root
  isNotFirstRender?: true
}>('onRenderClient.ts', {})

addEcosystemStamp()
initKeyBindings()
initInputModality()
initOnNavigation()
initDocsearchFocusReturn()
initTooltipGroup()
initMenuModalCloseListeners()

async function onRenderClient(pageContext: PageContextClient) {
  onRenderStart()

  let renderPromiseResolve!: () => void
  const renderPromise = new Promise<void>((r) => {
    renderPromiseResolve = r
  })
  let page = getPageElement(pageContext)
  page = <OnRenderDoneHook renderPromiseResolve={renderPromiseResolve}>{page}</OnRenderDoneHook>

  const container = document.getElementById('page-view')!
  // The current page's chip in the navigation swaps without a fade (see a11y.css)
  if (!pageContext.isHydration) document.documentElement.classList.add('dp-nav-switching')
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
    getAnnouncer().textContent = document.title
  } else {
    // Created empty beforehand: a live region announces changes, not its creation
    getAnnouncer()
  }

  await renderPromise
  // After a frame painted with the new current page
  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.documentElement.classList.remove('dp-nav-switching')),
  )

  autoScrollNav(!pageContext.isHydration)
  installSectionUrlHashs()
  setHydrationIsFinished()
  initGoogleAnalytics(pageContext)
  initUmami(pageContext)
  if (pageContext.config.docpress.darkMode) initThemeListener()

  globalObject.isNotFirstRender = true
}

function applyHead(pageContext: PageContextClient) {
  document.title = pageContext.resolved.documentTitle
}

// Client-side navigation: screen readers announce the new page (outside React: nothing to hydrate)
function getAnnouncer() {
  let announcer = document.getElementById('dp-route-announcer')
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'dp-route-announcer'
    announcer.className = 'sr-only'
    announcer.setAttribute('aria-live', 'polite')
    document.body.appendChild(announcer)
  }
  return announcer
}

function onRenderStart() {
  // It's redundant (and onLinkClick() is enough), but just to be sure.
  closeMenuModal()
}

function OnRenderDoneHook({
  renderPromiseResolve,
  children,
}: { renderPromiseResolve: () => void; children: React.ReactNode }) {
  useEffect(() => {
    renderPromiseResolve()
  })
  return children
}

// Used by:
// - https://github.com/vikejs/vike/blob/87cca54f30b3c7e71867763d5723493d7eef37ab/vike/client/client-routing-runtime/prefetch.ts#L309-L312
function addEcosystemStamp() {
  ;(window as any)._isBrilloutDocpress = true
}

async function initGoogleAnalytics(pageContext: PageContextClient) {
  const isFirstRender = !globalObject.isNotFirstRender
  const id = pageContext.config.docpress.googleAnalytics

  if (!id) return
  if (isFirstRender) await installGoogleAnalytics(id)
}
async function installGoogleAnalytics(id: string) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id)

  await addScript(`https://www.googletagmanager.com/gtag/js?id=${id}`)
}
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

async function initUmami(pageContext: PageContextClient) {
  // Only add script tag on first render
  if (globalObject.isNotFirstRender) {
    return
  }

  // Simple way to plug in umami
  const umamiId = pageContext.config.docpress.umamiId
  if (!umamiId) {
    return
  }

  try {
    await addScript('https://cloud.umami.is/script.js', {
      'data-website-id': umamiId,
    })
  } catch {
    // Umami analytics unavailable
  }
}

/** https://umami.is/docs/tracker-functions */
type Umami = {
  track: {
    (): void
    (eventName: string): void
    (data: object): void
    (eventName: string, data: object): void
  }
  identify: {
    (uniqueId: string): void
    (data: object): string
    (uniqueId: string, data: object): void
  }
}

declare global {
  interface Window {
    /** Script load is not guaranteed */
    umami?: Umami
  }
}
