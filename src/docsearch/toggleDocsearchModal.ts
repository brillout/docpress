export { closeDocsearchModal }
export { openDocsearchModal }

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
