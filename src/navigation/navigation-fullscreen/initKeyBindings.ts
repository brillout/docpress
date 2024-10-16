export { initKeyBindings }

import { closeDocsearchModal } from '../../algolia/closeDocsearchModal'
import { closeMenu, toggleMenu } from './initNavigationFullscreen'

function initKeyBindings() {
  window.addEventListener(
    // Cannot use `keyup`: https://stackoverflow.com/questions/66595035/how-to-detect-escape-key-if-search-bar-of-browser-is-open/66600548#66600548
    'keydown',
    (ev) => {
      if (ev.key === 'Escape') {
        closeDocsearchModal()
        closeMenu()
        return
      }

      const key = (ev.key || '').toLowerCase()
      const isCtrl = ev.metaKey || ev.ctrlKey
      if (isCtrl && key === 'm') {
        ev.preventDefault()
        closeDocsearchModal()
        toggleMenu()
        return
      }

      // Replicate https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/useDocSearchKeyboardEvents.ts#L45-L49
      if ((isCtrl && key === 'k') || (key === '/' && !isEditingContent(ev))) {
        ev.preventDefault()
        closeMenu()
        return
      }
    },
    false,
  )
}
function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement
  const tagName = element.tagName

  return element.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA'
}
