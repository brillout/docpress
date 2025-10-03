export { useSelectCodeLang }
export const initializeJsToggle_SSR = `initializeJsToggle();${initializeJsToggle.toString()};`

import { useState, useEffect, useCallback } from 'react'
import { assertWarning } from '../../utils/assert'

const storageKey = 'docpress:code-lang'
const codeLangDefaultSsr = 'ts'
const codeLangDefaultClient = 'js'

function useSelectCodeLang() {
  const [codeLangSelected, setCodeLangSelected] = useState(codeLangDefaultSsr)
  const updateState = () => {
    setCodeLangSelected(getCodeLangStorage())
  }
  const updateStateOnStorageEvent = (event: StorageEvent) => {
    if (event.key === storageKey) updateState()
  }

  const getCodeLangStorage = () => {
    try {
      return window.localStorage.getItem(storageKey) ?? codeLangDefaultClient
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error reading from localStorage')
      return codeLangDefaultClient
    }
  }

  const selectCodeLang = useCallback((value: string) => {
    try {
      window.localStorage.setItem(storageKey, value)
      setCodeLangSelected(value)
      window.dispatchEvent(new CustomEvent('code-lang-storage'))
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error setting localStorage')
    }
  }, [])

  useEffect(() => {
    // Initial load from localStorage
    updateState()
    // Update code lang in current tab
    window.addEventListener('code-lang-storage', updateState)
    // Update code lang if changed in another tab
    window.addEventListener('storage', updateStateOnStorageEvent)
    return () => {
      window.removeEventListener('code-lang-storage', updateState)
      window.removeEventListener('storage', updateStateOnStorageEvent)
    }
  }, [])

  return [codeLangSelected, selectCodeLang] as const
}

// WARNING: We cannot use variables storageKey nor codeLangDefaultClient here,
// because closures don't work as we serialize the function: `initializeJsToggle.toString()`.
// WARNING: We cannot use TypeScript here, for the same reason.
function initializeJsToggle() {
  const codeLangSelected = localStorage.getItem('docpress:code-lang') ?? 'js'
  if (codeLangSelected === 'js') {
    const inputs = document.querySelectorAll('.code-lang-toggle')
    // @ts-ignore
    for (const input of inputs) input.checked = false
  }
}

declare global {
  interface WindowEventMap {
    'code-lang-storage': CustomEvent
  }
}
