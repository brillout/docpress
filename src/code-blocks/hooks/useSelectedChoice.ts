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

// WARNING: We cannot use `keyPrefix` here: closures don't work because we serialize the function.
const initializeChoiceGroup_SSR = `initializeChoiceGroup();${initializeChoiceGroup.toString()};`
function initializeChoiceGroup() {
  const groupsElements = document.querySelectorAll<HTMLDivElement>('[data-choice-group]')
  for (const groupEl of groupsElements) {
    const choiceGroupName = groupEl.getAttribute('data-choice-group')!
    const storageKey = `docpress:choice:${choiceGroupName}`
    const selectedChoice = localStorage.getItem(storageKey)
    if (selectedChoice) {
      const selectEl = groupEl.querySelector<HTMLSelectElement>(`.select-choice`)!
      const selectedIndex = [...selectEl.options].findIndex((option) => option.value === selectedChoice)
      if (selectedIndex === -1) {
        localStorage.removeItem(storageKey)
      } else {
        selectEl.value = selectedChoice
      }
    }
  }
}
