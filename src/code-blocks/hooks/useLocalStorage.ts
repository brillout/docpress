export { useLocalStorage }

import { useCallback, useSyncExternalStore } from 'react'
import { assertWarning } from '../../utils/assert'

/**
 * A simple, generic `useLocalStorage` hook with SSR and cross-tab support.
 *
 * @param storageKey The key used in localStorage.
 * @param clientValue Default value for the client.
 * @param ssrValue Optional fallback for server-side rendering.
 * @returns A tuple `[value, setValue]`.
 */
function useLocalStorage(storageKey: string, clientValue: string, ssrValue?: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const listener = (e: StorageEvent) => {
        if (e.key === storageKey) callback()
      }
      window.addEventListener('storage', listener)
      return () => window.removeEventListener('storage', listener)
    },
    [storageKey],
  )

  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(storageKey) || clientValue
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error reading from localStorage')
      return clientValue
    }
  }, [storageKey, clientValue])

  const setValue = (value: string) => {
    try {
      localStorage.setItem(storageKey, value)
      // Manually dispatch a storage event to force update in the current tab
      window.dispatchEvent(new StorageEvent('storage', { key: storageKey }))
    } catch (error) {
      console.error(error)
      assertWarning(false, 'Error setting localStorage')
    }
  }

  const value = useSyncExternalStore(subscribe, getSnapshot, () => ssrValue || clientValue)

  return [value, setValue] as const
}
