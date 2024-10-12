// TODO/refactor: rename file
// TODO/refactor: rename function
export { initNavigationFullscreenOnce }
export { toggleMenu }

import { navigate } from 'vike/client/router'
import { assert } from '../../utils/client'

let urlBeforeMenu: string
let menuFullModal: HTMLElement | null = null

function initNavigationFullscreenOnce() {
  urlBeforeMenu = location.pathname === '/menu' ? '/' : location.href
  initKeyBindings()
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

function toggleMenu() {
  menuFullModal ||= document.getElementById('menu-full-modal')
  if (menuFullModal) {
    menuFullModal.classList.toggle('menu-full-modal-hide')
    return
  }
  assert(urlBeforeMenu !== undefined)
  if (location.pathname === '/menu') {
    navigate(urlBeforeMenu)
  } else {
    urlBeforeMenu = location.href
    navigate('/menu')
  }
  /*
  const key = '__docpress_urlBeforeMenu'
  if (location.pathname === '/menu') {
    navigate(localStorage.getItem(key) || '/')
  } else {
    localStorage.setItem(key, location.pathname)
    navigate('/menu')
  }
  */
}
