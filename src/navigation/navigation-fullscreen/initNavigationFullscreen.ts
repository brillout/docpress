export { initNavigationFullscreen }
export { initNavigationFullscreenOnce }
export { hideNavigationFullScreen }

import { navigate } from 'vike/client/router'
import { assert } from '../../utils/client'

let scrollPositionBeforeToggle: number
let urlBeforeMenu: string = location.pathname === '/menu' ? '/' : location.href

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
      //if (ev.key === 'Escape') toggleNavExpend()
      if (ev.key === 'Escape') toggleMenu()
      if (ev.key === 'm') toggleMenu()
    },
    false,
  )
  initTopNavigation()
}

function toggleMenu() {
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

function initNavigationFullscreen() {
  document.getElementById('navigation-fullscreen-button')!.onclick = toggleNavExpend
  document.getElementById('navigation-fullscreen-close')!.onclick = toggleNavExpend
}

function toggleNavExpend() {
  assert(scrollPositionBeforeToggle !== undefined)
  const navContainer = document.getElementById('navigation-container')!
  const scrollPos = navContainer.scrollTop
  document.documentElement.classList.toggle('navigation-fullscreen')
  navContainer.scrollTop = scrollPositionBeforeToggle
  scrollPositionBeforeToggle = scrollPos
}
function hideNavigationFullScreen() {
  if (!document.documentElement.classList.contains('navigation-fullscreen')) return
  toggleNavExpend()
}

function initTopNavigation() {
  document.addEventListener('click', (ev) => {
    const linkTag = findLinkTag(ev.target as HTMLElement)
    if (!linkTag) return
    if (linkTag.id !== 'doclink') return
    toggleNavExpend()
  })
}
function findLinkTag(target: HTMLElement): null | HTMLElement {
  while (target.tagName !== 'A') {
    const { parentNode } = target
    if (!parentNode) {
      return null
    }
    target = parentNode as HTMLElement
  }
  return target
}
