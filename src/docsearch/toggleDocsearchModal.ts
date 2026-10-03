export { closeDocsearchModal }
export { openDocsearchModal }
export { initDocsearchFocusReturn }

import { assert } from '../utils/client.js'

function closeDocsearchModal() {
  if (isClosed()) return
  toggle()
}

function openDocsearchModal() {
  if (!isClosed()) return
  toggle()
}

// There doesn't seem be an official API to open/close the DocSearch modal:
// - https://github.com/algolia/docsearch/issues/2321
// - https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/DocSearch.tsx#L52
function toggle() {
  // Trigger https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/useDocSearchKeyboardEvents.ts#L71
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

function isClosed() {
  const test1 = !document.body.classList.contains('DocSearch--active')
  const test2 = document.getElementsByClassName('DocSearch-Modal').length === 0
  assert(test1 === test2)
  return test1 || test2
}

// Closing the search modal returns the focus where it was (DocSearch's own button, which it would focus, is hidden)
let isFocusReturnInstalled = false
function initDocsearchFocusReturn() {
  if (isFocusReturnInstalled) return
  isFocusReturnInstalled = true
  let focusedBefore: HTMLElement | null = null
  document.addEventListener('focusin', (ev) => {
    const target = ev.target as HTMLElement
    if (!target.closest('.DocSearch-Container')) focusedBefore = target
  })
  let isOpen = false
  new MutationObserver(() => {
    const isOpenNow = document.body.classList.contains('DocSearch--active')
    if (isOpen && !isOpenNow) {
      const { activeElement } = document
      const isFocusLost = !activeElement || activeElement === document.body
      if (isFocusLost && focusedBefore?.isConnected) focusedBefore.focus({ preventScroll: true })
    }
    isOpen = isOpenNow
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] })
}
