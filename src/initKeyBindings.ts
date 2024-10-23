export { initKeyBindings }

import { closeDocsearchModal } from './docsearch/toggleDocsearchModal'
import { closeMenuModal, toggleMenuModal } from './MenuModal'

function initKeyBindings() {
  window.addEventListener(
    'keydown',
    (ev) => {
      const key = (ev.key || '').toLowerCase()

      if (key === 'escape') {
        closeDocsearchModal()
        closeMenuModal()
      }

      if (key === 'm' && ev.ctrlKey) {
        closeDocsearchModal()
        toggleMenuModal()
      }

      // Replicates docsearch keybinding
      // https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/useDocSearchKeyboardEvents.ts#L45-L49
      if ((key === 'k' && (ev.ctrlKey || ev.metaKey)) || (key === '/' && !isEditingContent(ev))) {
        closeMenuModal()
      }
    },
    { passive: true },
  )
}
function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement
  const tagName = element.tagName

  return element.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA'
}
