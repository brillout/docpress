export { useSelectedChoice }
export { initializeChoiceGroup_SSR }

import { useLocalStorage } from './useLocalStorage'

const keyPrefix = 'docpress'

/**
 * Stores and retrieves a selected choice from local storage.
 *
 * @param choiceGroupName Group name for the stored choice.
 * @param defaultValue Default choice value.
 * @returns `[selectedChoice, setSelectedChoice]`.
 */
function useSelectedChoice(choiceGroupName: string, defaultValue: string) {
  return useLocalStorage(`${keyPrefix}:choice:${choiceGroupName}`, defaultValue)
}

// WARNING: We cannot use the keyPrefix variable here: closures don't work because we serialize the function.
const initializeChoiceGroup_SSR = `initializeChoiceGroup();${initializeChoiceGroup.toString()};`
function initializeChoiceGroup() {
  const groupsElements = document.querySelectorAll<HTMLDivElement>('[data-choice-group]')
  for (const groupEl of groupsElements) {
    const groupName = groupEl.getAttribute('data-choice-group')!
    const selectedChoice = localStorage.getItem(`docpress:choice:${groupName}`)
    if (!selectedChoice) continue
    const selectEl = groupEl.querySelector<HTMLSelectElement>(`.select-choice`)
    if (selectEl) selectEl.value = selectedChoice
  }
}
