export { useSelectedLanguage }

import { useState, useEffect, useCallback } from 'react'

const key = 'docpress:selectedLang'

declare global {
  interface WindowEventMap {
    'lang-storage': CustomEvent
  }
}

function useSelectedLanguage(initialValue: string = 'js') {
  const ssrValue = 'ts'
  const [selectedLang, setSelectedLang] = useState(ssrValue)

  const getValue = useCallback(() => {
    try {
      const value = localStorage.getItem(key)
      return value ?? initialValue
    } catch (error) {
      console.warn('Error reading from localStorage:', error)
      return initialValue
    }
  }, [initialValue])

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
    setSelectedLang(getValue())
  }, [getValue])

  useEffect(() => {
    // Update language in current tab
    const handleCustomEvent = () => {
      setSelectedLang(getValue())
    }
    // Update language if changed in another tab
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
  }, [getValue])

  return [selectedLang, setValue] as const
}
