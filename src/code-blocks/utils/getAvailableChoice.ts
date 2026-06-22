export { getAvailableChoice }

import type { ChoiceItem } from '../../types/Config.js'
import { resolveChoice } from './resolveChoices.js'

// A page may include only some of a group's choices, so a choice selected elsewhere (and persisted in
// localStorage) can be absent here — which would otherwise render nothing (#169). Resolve to a choice
// that exists on the current page.
function getAvailableChoice(
  selectedChoice: string,
  choices: (string | ChoiceItem)[],
  emptyChoices: string[],
  defaultChoice: string,
): string {
  const isAvailable = (choiceName: string) => !emptyChoices.includes(choiceName)
  if (isAvailable(selectedChoice)) return selectedChoice
  if (isAvailable(defaultChoice)) return defaultChoice
  const choicesResolved = choices.map(resolveChoice)
  return choicesResolved.find((choice) => isAvailable(choice.name))?.name ?? selectedChoice
}
