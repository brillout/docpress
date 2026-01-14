export { useSelectedChoice }
export { initializeCodeGroup_SSR }

import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

const keyPrefix = 'docpress'

/**
 * Tracks the selected choice.
 * Uses `useLocalStorage` if `persistId` is provided, otherwise regular state.
 *
 * @param persistId Optional ID to persist selection.
 * @param defaultValue Default choice value.
 * @returns `[selectedChoice, setSelectedChoice]`.
 */
function useSelectedChoice(persistId: string | null, defaultValue: string) {
  if (!persistId) return useState(defaultValue)

  return useLocalStorage(`${keyPrefix}:${persistId}`, defaultValue)
}

// WARNING: We cannot use the keyPrefix variable here: closures don't work because we serialize the function.
const initializeCodeGroup_SSR = `initializeCodeGroup();${initializeCodeGroup.toString()};`
function initializeCodeGroup() {
  const groupsElements = document.querySelectorAll<HTMLDivElement>('[data-group-name]')
  for (const groupEl of groupsElements) {
    const persistId = groupEl.getAttribute('data-group-name')!
    const selectedChoice = localStorage.getItem(`docpress:${persistId}`)
    if (!selectedChoice) return
    const selectEl = groupEl.querySelector<HTMLSelectElement>('select[name="select-choice"]')
    if (selectEl) selectEl.value = selectedChoice
  }
}
