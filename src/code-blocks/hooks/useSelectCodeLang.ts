export { useSelectCodeLang }
export { initializeJsToggle_SSR }

import { useLocalStorage } from './useLocalStorage'

const storageKey = 'docpress:code-lang'
const codeLangDefaultSsr = 'ts'
const codeLangDefaultClient = 'js'

function useSelectCodeLang() {
  return useLocalStorage(storageKey, codeLangDefaultClient, codeLangDefaultSsr)
}

// WARNING: We cannot use the variables storageKey nor codeLangDefaultClient here: closures
// don't work because we serialize the function.
// WARNING: We cannot use TypeScript here, for the same reason.
const initializeJsToggle_SSR = `initializeJsToggle();${initializeJsToggle.toString()};`
function initializeJsToggle() {
  const codeLangSelected = localStorage.getItem('docpress:code-lang') ?? 'js'
  if (codeLangSelected === 'js') {
    const inputs = document.querySelectorAll('.code-lang-toggle')
    // @ts-ignore
    for (const input of inputs) input.checked = false
  }
}
