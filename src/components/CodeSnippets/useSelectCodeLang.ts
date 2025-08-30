export { useSelectCodeLang }

import { useState, useEffect, useCallback } from 'react'
import { assertWarning } from '../../utils/assert'

const key = 'docpress:code-lang'
const defaultSsrLang = 'ts'
const defaultClientLang = 'js'

declare global {
  interface WindowEventMap {
    'code-lang-storage': CustomEvent
  }
}

function useSelectCodeLang() {
  const [selectedLang, setSelectedLang] = useState(defaultSsrLang)

  const getValue = () => {
    try {
      return localStorage.getItem(key) ?? defaultClientLang
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error reading from localStorage')
      return defaultClientLang
    }
  }

  const setValue = useCallback((value: string) => {
    try {
      window.localStorage.setItem(key, value)
      setSelectedLang(value)
      window.dispatchEvent(new CustomEvent('code-lang-storage'))
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error setting localStorage')
    }
  }, [])

  useEffect(() => {
    // Initial load from localStorage
    setSelectedLang(getValue())
    // Update code lang in current tab
    const handleCustomEvent = () => {
      setSelectedLang(getValue())
    }
    // Update code lang if changed in another tab
    const handleNativeStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setSelectedLang(getValue())
      }
    }

    window.addEventListener('code-lang-storage', handleCustomEvent)
    window.addEventListener('storage', handleNativeStorage)

    return () => {
      window.removeEventListener('code-lang-storage', handleCustomEvent)
      window.removeEventListener('storage', handleNativeStorage)
    }
  }, [])

  return [selectedLang, setValue] as const
}
