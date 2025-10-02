export { useSelectCodeLang }

import { useState, useEffect, useCallback } from 'react'
import { assertWarning } from '../../utils/assert'

const storageKey = 'docpress:code-lang'
const codeLangDefault = 'ts'

function useSelectCodeLang() {
  const [codeLangSelected, setCodeLangSelected] = useState(codeLangDefault)
  const updateState = () => setCodeLangSelected(getCodeLangSelected())

  const updateStateOnStorageEvent = (event: StorageEvent) => {
    if (event.key === storageKey) updateState()
  }

  const getCodeLangSelected = () => {
    try {
      return localStorage.getItem(storageKey) || codeLangSelected
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error reading from localStorage')
      return codeLangSelected
    }
  }

  const selectCodeLang = useCallback((value: string) => {
    try {
      localStorage.setItem(storageKey, value)
      setCodeLangSelected(value)
      window.dispatchEvent(new CustomEvent('code-lang-storage'))
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error setting localStorage')
    }
  }, [])

  useEffect(() => {
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
