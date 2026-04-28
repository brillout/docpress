export { useLocalStorage }

import { useCallback, useSyncExternalStore } from 'react'

type LocalStorageSnapshot = {
  value: string
  fromLocalStorage: boolean
}

/**
 * A simple, generic `useLocalStorage` hook with SSR and cross-tab support.
 *
 * @param storageKey The key used in localStorage.
 * @param clientValue Default value for the client.
 * @param ssrValue Optional fallback for server-side rendering.
 * @returns A tuple `[value, setValue]`.
 */
function useLocalStorage(storageKey: string, clientValue: string, ssrValue?: string) {
  let lastSnapshot: LocalStorageSnapshot | null = null
  const serverSnapshot = { value: ssrValue ?? clientValue, fromLocalStorage: false }

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

  const getClientSnapshot = useCallback((): LocalStorageSnapshot => {
    const storedValue = localStorage.getItem(storageKey)

    const next =
      storedValue !== null
        ? { value: storedValue, fromLocalStorage: true }
        : { value: clientValue, fromLocalStorage: false }

    if (lastSnapshot && lastSnapshot.value === next.value && lastSnapshot.fromLocalStorage === next.fromLocalStorage) {
      return lastSnapshot
    }

    lastSnapshot = next
    return next
  }, [storageKey, clientValue])

  const setValue = (value: string) => {
    localStorage.setItem(storageKey, value)
    // Manually dispatch a storage event to force update in the current tab
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }))
  }

  const value = useSyncExternalStore(subscribe, getClientSnapshot, () => serverSnapshot)

  return [value, setValue] as const
}
