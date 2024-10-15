// TODO/refactor: rename file
// TODO/refactor: rename function
export { initNavigationFullscreenOnce }
export { toggleMenu }
export { hideMenuModalUponVikeClientSideNavigation }
export { menuUrl }
export { isMenuUrl }

import { navigate, onPopState } from 'vike/client/router'
import { assert } from '../../utils/client'
import { getpageContextCurrent } from '../../renderer/onRenderClient'
import { menuUrl } from './menuUrl'

let stateBeforeMenuLocalMem: StateBeforeMenu | null = null
let modalEl: HTMLElement | null = null
const menuModalShow = 'menu-modal-show'
const sessionStorageKey = '__docpress_stateBeforeMenu'

type StateBeforeMenu = { url: string; title: string }

function initNavigationFullscreenOnce() {
  if (!isMenuUrl()) setSateBeforeMenu()
  initKeyBindings()
  initOnUrlChange()
}
function initKeyBindings() {
  document.addEventListener(
    // We don't use keydown to not interfere with user pressing `<Esc>` for closing the browser's `<Ctrl-F>` search diablog, see https://stackoverflow.com/questions/66595035/how-to-detect-escape-key-if-search-bar-of-browser-is-open
    'keydown',
    (ev) => {
      if (document.body.classList.contains('DocSearch--active')) return
      if (ev.key === 'Escape') toggleMenu()
      if (ev.key === 'm') toggleMenu()
    },
    false,
  )
}

async function toggleMenu() {
  // Use modal
  if (isModalAvailable()) {
    toggleModal()
    return
  }

  // Use history
  if (isMenuUrl() && typeof (window as any).navigation !== 'undefined' && (window as any).navigation.canGoBack) {
    // The advantage of history over navigate() is that it restores the scroll position
    /*
    // Only Chrome: https://stackoverflow.com/questions/3588315/how-to-check-if-the-user-can-go-back-in-browser-history-or-not/75936209#75936209
    (window as any).navigation.back()
    return
    //*/
  }

  // Use navigate()
  if (isMenuUrl()) {
    const stateBeforeMenu = getStateBeforeMenu()
    navigate(stateBeforeMenu.url)
  } else {
    setSateBeforeMenu()
    navigate(menuUrl)
  }
}

function getStateBeforeMenu(): StateBeforeMenu {
  return stateBeforeMenuLocalMem || getStateBeforeMenuSaved() || { url: '/', title: 'Vike' }
}
function setSateBeforeMenu() {
  assert(!isMenuUrl())
  const stateBeforeMenu = { url: location.href, title: document.title }
  stateBeforeMenuLocalMem = stateBeforeMenu
  setStateBeforeMenuSaved(stateBeforeMenu)
}

function getStateBeforeMenuSaved(): StateBeforeMenu | null {
  const val = sessionStorage.getItem(sessionStorageKey)
  if (!val) return null
  return JSON.parse(val)
}
function setStateBeforeMenuSaved(stateBeforeMenu: StateBeforeMenu) {
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(stateBeforeMenu))
}

function toggleModal() {
  assert(isModalAvailable())
  let urlNext: string
  let titleNext: string
  if (!isMenuUrl()) {
    urlNext = menuUrl
    titleNext = 'Menu'
    setSateBeforeMenu()
  } else {
    const stateBeforeMenu = getStateBeforeMenu()
    urlNext = stateBeforeMenu.url
    titleNext = stateBeforeMenu.title
  }
  console.log(
    'pushState',
    urlNext,
    //new Error().stack
  )
  setModalShow()
  history.pushState(null, '', urlNext)
  document.title = titleNext
}
function isModalAvailable() {
  modalEl ||= document.getElementById(
    // TODO/refactor: rename menu-full-modal => menu-modal ?
    'menu-full-modal',
  )
  if (!modalEl) return false
  if (isMenuPageContext() !== false) return false
  return true
}

function initOnUrlChange() {
  onPopState(({ previous }) => {
    console.log('popstate', window.history.state)
    // Let Vike handle it
    if (previous.url !== menuUrl && !isMenuUrl()) return
    if (!isModalAvailable()) return

    // Use modal
    setModalShow()
    return true
  })
}

function setModalShow() {
  assert(isModalAvailable())
  const { classList } = document.body
  if (isMenuUrl()) {
    classList.add(menuModalShow)
  } else {
    classList.remove(menuModalShow)
  }
}
function hideMenuModalUponVikeClientSideNavigation() {
  document.body.classList.remove(menuModalShow)
}

function isMenuUrl() {
  return window.location.pathname === menuUrl
}
function isMenuPageContext(): null | boolean {
  const pageContext = getpageContextCurrent()
  if (!pageContext) return null
  return pageContext.urlPathname === menuUrl
}
