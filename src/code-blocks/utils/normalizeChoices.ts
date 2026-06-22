export { normalizeChoice, normalizeChoices }

import type { ChoiceItem } from '../../types/Config.js'

// A choice can be defined as a plain string (shorthand for `{ name }`, no icon) or as an object.
// We normalize both to `{ name, icon?, iconStyle? }` so the rest of the code only deals with objects.
function normalizeChoice(choice: string | ChoiceItem): ChoiceItem {
  return typeof choice === 'string' ? { name: choice } : choice
}
function normalizeChoices(choices: (string | ChoiceItem)[]): ChoiceItem[] {
  return choices.map(normalizeChoice)
}
