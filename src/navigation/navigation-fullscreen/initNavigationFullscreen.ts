export { initNavigationFullscreen }
export { initNavigationFullscreenOnce }
export { hideNavigationFullScreen }

import { assert } from '../../utils/client'

let scrollPositionBeforeToggle: number

function initNavigationFullscreenOnce() {
  scrollPositionBeforeToggle = 0 // Initial scroll of fullscreen navigation is 0
  initKeyBindings()
}
function initKeyBindings() {
  document.addEventListener(
    // We don't use keydown to not interfere with user pressing `<Esc>` for closing the browser's `<Ctrl-F>` search diablog, see https://stackoverflow.com/questions/66595035/how-to-detect-escape-key-if-search-bar-of-browser-is-open
    'keydown',
    (ev) => {
      if (document.body.classList.contains('DocSearch--active')) return
      if (ev.key === 'Escape') toggleNavExpend()
    },
    false,
  )
  initTopNavigation()
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
