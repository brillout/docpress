export { useSelectCodeLang }

import { useState, useEffect, useCallback } from 'react'
import { assertWarning } from '../../utils/assert'

const key = 'docpress:code-lang'
const codeLangdefaultSsr = 'ts'
const codeLangDefaultClient = 'js'

declare global {
  interface WindowEventMap {
    'code-lang-storage': CustomEvent
  }
}

function useSelectCodeLang() {
  const [codeLangSelected, setCodeLangSelected] = useState(codeLangdefaultSsr)
  const updateState = () => {
    setCodeLangSelected(getCodeLangStorage())
  }

  const getCodeLangStorage = () => {
    try {
      return localStorage.getItem(key) ?? codeLangDefaultClient
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error reading from localStorage')
      return codeLangDefaultClient
    }
  }

  const selectCodeLang = useCallback((value: string) => {
    try {
      window.localStorage.setItem(key, value)
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

    const handleNativeStorage = (event: StorageEvent) => {
      if (event.key === key) {
        updateState()
      }
    }

    // Update code lang in current tab
    window.addEventListener('code-lang-storage', updateState)
    // Update code lang if changed in another tab
    window.addEventListener('storage', handleNativeStorage)

    return () => {
      window.removeEventListener('code-lang-storage', updateState)
      window.removeEventListener('storage', handleNativeStorage)
    }
  }, [])

  return [codeLangSelected, selectCodeLang] as const
}
