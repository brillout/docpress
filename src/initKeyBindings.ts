export { initKeyBindings }
export { initInputModality }

import { closeDocsearchModal } from './docsearch/toggleDocsearchModal.js'
import { closeMenuModal, closeMenuModalAndFocusToggle } from './MenuModal/toggleMenuModal.js'

function initKeyBindings() {
  window.addEventListener(
    'keydown',
    (ev) => {
      const key = (ev.key || '').toLowerCase()

      if (key === 'escape') {
        closeDocsearchModal()
        closeMenuModalAndFocusToggle()
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

// `<html data-input="keyboard">` while the keyboard is used: disclosures then open and close without animating (a11y.css)
function initInputModality() {
  const { dataset } = document.documentElement
  window.addEventListener('keydown', () => (dataset.input = 'keyboard'), { capture: true, passive: true })
  const onPointer = () => {
    if (dataset.input !== 'pointer') dataset.input = 'pointer'
  }
  window.addEventListener('pointerdown', onPointer, { capture: true, passive: true })
  // Before `mouseenter` (which opens the top nav's menus)
  window.addEventListener('pointerover', onPointer, { capture: true, passive: true })
}
