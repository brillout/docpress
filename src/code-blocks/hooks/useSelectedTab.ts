export { useSelectedTab }
export { initializeCodeTabs_SSR }

import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

const keyPrefix = 'docpress'

/**
 * Tracks the selected tab.
 * Uses `useLocalStorage` if `persistId` is provided, otherwise regular state.
 *
 * @param persistId Optional ID to persist selection.
 * @param defaultValue Default tab value.
 * @returns `[selectedTab, setSelectedTab]`.
 */
function useSelectedTab(persistId: string | undefined, defaultValue: string) {
  if (!persistId) return useState(defaultValue)

  return useLocalStorage(`${keyPrefix}:${persistId}`, defaultValue)
}

// WARNING: We cannot use the keyPrefix variable here: closures don't work because we serialize the function.
const initializeCodeTabs_SSR = `initializeCodeTabs();${initializeCodeTabs.toString()};`
function initializeCodeTabs() {
  const tabsElements = document.querySelectorAll<HTMLDivElement>('[data-key]')
  for (const tabsElement of tabsElements) {
    const persistId = tabsElement.getAttribute('data-key')!
    const selectedTab = localStorage.getItem(`docpress:${persistId}`)
    if (!selectedTab) return
    const inputs = tabsElement.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    for (const input of inputs) {
      input.checked = input.id.endsWith(`-${selectedTab}`)
    }
  }
}
