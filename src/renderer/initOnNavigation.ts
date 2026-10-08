export { initOnNavigation }

import { isBrowser } from '../utils/isBrowser.js'
import { closeMenuModal } from '../MenuModal/toggleMenuModal.js'

function onNavigation() {
  closeMenuModal()
}

function initOnNavigation() {
  if (!isBrowser()) return
  document.addEventListener('click', onLinkClick)
  // It's redundant as onLinkClick() should be enough, but just to be sure.
  addEventListener('hashchange', onNavigation)
}

function onLinkClick(ev: MouseEvent) {
  if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return
  const linkTag = findLinkTag(ev.target as HTMLElement)
  if (!linkTag) return
  const href = linkTag.getAttribute('href')
  if (!href) return
  if (!href.startsWith('/') && !href.startsWith('#')) return
  onNavigation()
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
