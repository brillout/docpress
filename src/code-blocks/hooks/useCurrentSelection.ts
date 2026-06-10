export { useCurrentSelection }
export { initializeChoiceGroup_SSR }

import { useLocalStorage } from './useLocalStorage.js'

const keyPrefix = 'docpress'

/**
 * Stores and retrieves a selected choice from local storage.
 *
 * @param choiceGroupName Group name for the stored choice.
 * @param defaultValue Default choice value.
 * @returns `[selectedChoice, setSelectedChoice]`.
 */
function useCurrentSelection(choiceGroupName: string, defaultValue: string) {
  return useLocalStorage(`${keyPrefix}:choice:${choiceGroupName}`, defaultValue)
}

// WARNING: We cannot use `keyPrefix` here: closures don't work because we serialize the function.
const initializeChoiceGroup_SSR = `initializeChoiceGroup();${initializeChoiceGroup.toString()};`
function initializeChoiceGroup() {
  const groupsElements = [
    ...document.querySelectorAll('select[data-choice-group]'),
    ...document.querySelectorAll('div[data-choice-group]'),
  ]
  for (const groupEl of groupsElements) {
    const choiceGroupName = groupEl.getAttribute('data-choice-group')
    if (!choiceGroupName) continue
    const storageKey = `docpress:choice:${choiceGroupName}`
    const selectedChoice = localStorage.getItem(storageKey)
    if (!selectedChoice) continue
    switch (groupEl.tagName) {
      case 'SELECT':
        const selectEl = groupEl as HTMLSelectElement
        const optionExists = [...selectEl.options].some((opt) => opt.value === selectedChoice)
        if (!optionExists) localStorage.removeItem(storageKey)
        else selectEl.value = selectedChoice
        break
      case 'DIV':
        const radioEl = groupEl.querySelector<HTMLInputElement>(`input[type="radio"][value="${selectedChoice}"]`)
        if (radioEl) radioEl.checked = true
      default:
        break
    }
  }
}
