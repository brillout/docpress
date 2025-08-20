export { useSelectedLanguage }

import { useState, useEffect, useCallback } from 'react'

const key = 'docpress:selectedLang'

declare global {
  interface WindowEventMap {
    'lang-storage': CustomEvent
  }
}

function useSelectedLanguage(initialValue: string = 'js') {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedLang, setSelectedLang] = useState(() => {
    if (isMounted) {
      return localStorage.getItem(key) ?? initialValue
    }
    return initialValue
  })

  const getValue = useCallback(() => {
    try {
      const value = localStorage.getItem(key)
      return value ?? initialValue
    } catch (error) {
      console.warn(`Error reading from localStorage :`, error)
      return initialValue
    }
  }, [initialValue])

  const setValue = useCallback((value: string) => {
    try {
      window.localStorage.setItem(key, value)
      setSelectedLang(value)
      window.dispatchEvent(new StorageEvent('lang-storage', { key }))
    } catch (error) {
      console.warn(`Error setting localStorage:`, error)
    }
  }, [])

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return
      }
      setSelectedLang(getValue())
    },
    [getValue],
  )

  useEffect(() => {
    setSelectedLang(getValue())
    setIsMounted(true)
  }, [getValue])

  useEffect(() => {
    window.addEventListener('lang-storage', handleStorageChange)
    return () => {
      window.removeEventListener('lang-storage', handleStorageChange)
    }
  }, [handleStorageChange])

  return [selectedLang, setValue] as const
}
