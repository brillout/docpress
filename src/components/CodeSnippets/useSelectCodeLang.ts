export { useSelectCodeLang }

import { useState, useEffect, useCallback } from 'react'
import { assertWarning } from '../../utils/assert'

const storageKey = 'docpress:code-lang'
const codeLangdefaultSsr = 'ts'
const codeLangDefaultClient = 'js'

function useSelectCodeLang() {
  const [codeLangSelected, setCodeLangSelected] = useState(codeLangdefaultSsr)
  const updateState = () => {
    setCodeLangSelected(getCodeLangStorage())
  }
  const updateStateOnStorageEvent = (event: StorageEvent) => {
    if (event.key === storageKey) return
    updateState()
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

declare global {
  interface WindowEventMap {
    'code-lang-storage': CustomEvent
  }
}
