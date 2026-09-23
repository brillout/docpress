export { getAvailableChoice }

import type { ChoiceItem } from '../../types/Config.js'
import { resolveChoice } from './resolveChoices.js'

// A page may include only some of a group's choices, so a choice selected elsewhere (and persisted in
// localStorage) can be absent here — which would otherwise render nothing (#169). Resolve to a choice
// that exists on the current page.
// For a choice group, the unavailable choices are the choices absent from the whole page, not only the choices the
// group doesn't have content for: a group displays nothing while a choice it doesn't have content for is selected
// (e.g. a `:::Choice{#Express}` note while the `Hono` tab is selected).
function getAvailableChoice(
  selectedChoice: string,
  choices: (string | ChoiceItem)[],
  unavailableChoices: string[],
  defaultChoice: string,
): string {
  const isAvailable = (choiceName: string) => !unavailableChoices.includes(choiceName)
  if (isAvailable(selectedChoice)) return selectedChoice
  if (isAvailable(defaultChoice)) return defaultChoice
  const choicesResolved = choices.map(resolveChoice)
  return choicesResolved.find((choice) => isAvailable(choice.name))?.name ?? selectedChoice
}
