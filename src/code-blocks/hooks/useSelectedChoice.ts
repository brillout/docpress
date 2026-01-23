export { useSelectedChoice }
export { initializeChoiceGroup_SSR }

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
const initializeChoiceGroup_SSR = `initializeChoiceGroup();${initializeChoiceGroup.toString()};`
function initializeChoiceGroup() {
  const groupsElements = document.querySelectorAll<HTMLDivElement>('[data-choice-group]')
  for (const groupEl of groupsElements) {
    const groupName = groupEl.getAttribute('data-choice-group')!
    const selectedChoice = localStorage.getItem(`docpress:${groupName}`)
    if (!selectedChoice) continue
    const selectEl = groupEl.querySelector<HTMLSelectElement>(`.select-choice`)
    if (selectEl) selectEl.value = selectedChoice
  }
}
