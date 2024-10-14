// TODO/refactor: rename file
// TODO/refactor: rename function
export { initNavigationFullscreenOnce }
export { toggleMenu }
export { hideMenuModal }
export { menuUrl }
export { isMenuUrl }

import { navigate } from 'vike/client/router'
import { assert } from '../../utils/client'
import { getpageContextCurrent } from '../../renderer/onRenderClient'
import { menuUrl } from './menuUrl'

let stateBeforeMenuLocalMem: StateBeforeMenu | null = null
let menuFullModal: HTMLElement | null = null
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

function hideMenuModal() {
  document.body.classList.remove(menuModalShow)
}

async function toggleMenu() {
  // Use modal
  const modal = getModal()
  if (modal) {
    const pageContext = getpageContextCurrent()
    if (pageContext!.urlPathname !== menuUrl) {
      modal.toggle()
      return
    }
  }

  // Use history
  if (isMenuUrl() && typeof (window as any).navigation !== 'undefined' && (window as any).navigation.canGoBack) {
    // The advantage of history over navigate() is that it restores the scroll position
    // Only for Chrome:
    // https://stackoverflow.com/questions/3588315/how-to-check-if-the-user-can-go-back-in-browser-history-or-not/75936209#75936209
    /*
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

function getModal() {
  // TODO/refactor: rename menu-full-modal => menu-modal ?
  menuFullModal ||= document.getElementById('menu-full-modal')
  if (!menuFullModal) return null

  return {
    toggle,
    hide,
  }

  function toggle() {
    udpateUrl()
  }
  function hide() {
    if (!isMenuUrl()) return
    toggle()
  }

  function udpateUrl() {
    let urlNew: string
    let titleNew: string
    if (!isMenuUrl()) {
      urlNew = menuUrl
      titleNew = 'Menu'
      setSateBeforeMenu()
    } else {
      const stateBeforeMenu = getStateBeforeMenu()
      urlNew = stateBeforeMenu.url
      titleNew = stateBeforeMenu.title
    }

    console.log(
      'pushState',
      urlNew,
      //new Error().stack
    )
    history.pushState(null, '', urlNew)
    setModalShow()
    document.title = titleNew
  }
}

function initOnUrlChange() {
  window.addEventListener('popstate', () => {
    console.log('popstate', window.history.state)
    setModalShow(
      // Let Vike make its client-side navigation
      true,
    )
  })
}

function setModalShow(doNotApplyAddEffect?: boolean) {
  const { classList } = document.body
  if (isMenuUrl()) {
    if (doNotApplyAddEffect) return
    classList.add(menuModalShow)
  } else {
    classList.remove(menuModalShow)
  }
}

function isMenuUrl() {
  return window.location.pathname === menuUrl
}
