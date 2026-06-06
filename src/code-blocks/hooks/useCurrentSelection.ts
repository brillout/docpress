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
  const groupsElements = document.querySelectorAll<HTMLDivElement>('[data-choice-group]')
  for (const groupEl of groupsElements) {
    const choiceGroupName = groupEl.dataset.choiceGroup
    if (!choiceGroupName) continue
    const storageKey = `docpress:choice:${choiceGroupName}`
    const selectedChoice = localStorage.getItem(storageKey)
    if (!selectedChoice) continue
    const selectEl = groupEl.querySelector<HTMLSelectElement>(`select[name="choicesFor-${choiceGroupName}"]`)
    if (selectEl) {
      const optionExists = [...selectEl.options].some((opt) => opt.value === selectedChoice)
      if (!optionExists) localStorage.removeItem(storageKey)
      else selectEl.value = selectedChoice
    } else {
      const radiosElements = [...groupEl.querySelectorAll<HTMLInputElement>(`input[type="radio"]`)]
      if (radiosElements.length > 0) {
        const radio = radiosElements.find((radio) => radio.value === selectedChoice)
        if (!radio) localStorage.removeItem(storageKey)
        else radio.checked = true
      }
    }
  }
}
