export { closeDocsearchModal }

import { assert } from '../utils/client'

// There doesn't seem be an official API to close the DocSearch modal:
// - https://github.com/algolia/docsearch/issues/2321
// - https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/DocSearch.tsx#L52
function closeDocsearchModal() {
  const test1 = !document.body.classList.contains('DocSearch--active')
  const test2 = document.getElementsByClassName('DocSearch-Modal').length === 0
  assert(test1 === test2)
  const isAlreadyClosed = test1 || test2
  if (isAlreadyClosed) return
  // Trigger https://github.com/algolia/docsearch/blob/90f3c6aabbc324fe49e9a1dfe0906fcd4d90f27b/packages/docsearch-react/src/useDocSearchKeyboardEvents.ts#L71
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}
