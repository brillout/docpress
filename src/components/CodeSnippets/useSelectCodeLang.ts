export { useSelectCodeLang }

import { useState, useEffect, useCallback } from 'react'

const key = 'docpress:codeLang'
const defaultSsrLang = 'ts'
const defaultClientLang = 'js'

declare global {
  interface WindowEventMap {
    'lang-storage': CustomEvent
  }
}

function useSelectCodeLang() {
  const [selectedLang, setSelectedLang] = useState(defaultSsrLang)

  const getValue = () => {
    try {
      return localStorage.getItem(key) ?? defaultClientLang
    } catch (error) {
      console.warn('Error reading from localStorage:', error)
      return defaultClientLang
    }
  }

  const setValue = useCallback((value: string) => {
    try {
      window.localStorage.setItem(key, value)
      setSelectedLang(value)
      window.dispatchEvent(new CustomEvent('lang-storage'))
    } catch (error) {
      console.warn('Error setting localStorage:', error)
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

    window.addEventListener('lang-storage', handleCustomEvent)
    window.addEventListener('storage', handleNativeStorage)

    return () => {
      window.removeEventListener('lang-storage', handleCustomEvent)
      window.removeEventListener('storage', handleNativeStorage)
    }
  }, [])

  return [selectedLang, setValue] as const
}
