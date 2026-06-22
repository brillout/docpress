export { resolveChoices, resolveChoice }
export type { ResolvedChoices }

import type { Choice, ChoiceItem } from '../../types/Config.js'

type ResolvedChoices = Record<string, Omit<Choice, 'choices'> & { choices: ChoiceItem[] }>

function resolveChoices(choicesConfig: Record<string, Choice>): ResolvedChoices {
  return Object.fromEntries(
    Object.entries(choicesConfig).map(([name, group]) => [
      name,
      { ...group, choices: group.choices.map(resolveChoice) },
    ]),
  )
}
function resolveChoice(choice: string | ChoiceItem): ChoiceItem {
  return typeof choice === 'string' ? { name: choice } : choice
}
