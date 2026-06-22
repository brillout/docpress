export { getAvailableChoice }

import type { ChoiceItem } from '../../types/Config.js'

// A page can define a choice group with only a subset of the group's choices (e.g. only `React` and
// `Vue` while the group also defines `Solid`). The missing choices are "empty" on that page. When the
// currently selected choice — typically a global preference persisted in `localStorage` — isn't
// available on the current page, displaying it would show nothing (https://github.com/brillout/docpress/issues/169).
// We then fall back to the group's default choice, or to the first available choice if the default
// itself isn't available on the current page.
function getAvailableChoice(
  selectedChoice: string,
  choices: ChoiceItem[],
  emptyChoices: string[],
  defaultChoice: string,
): string {
  const isAvailable = (choiceName: string) => !emptyChoices.includes(choiceName)
  if (isAvailable(selectedChoice)) return selectedChoice
  if (isAvailable(defaultChoice)) return defaultChoice
  return choices.find((choice) => isAvailable(choice.name))?.name ?? selectedChoice
}
