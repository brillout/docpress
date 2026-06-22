export type { ChoiceGroup, ChoiceGroupWithParent, ParentChoiceGroup }

import type { Config, ChoiceItem } from '../types/Config.js'

type ChoiceGroup = Omit<NonNullable<Config['choices']>[string], 'choices'> & {
  name: string
  // Always normalized to objects (built at resolve time), regardless of how the user defined them.
  choices: ChoiceItem[]
  emptyChoices: string[]
  hidden: boolean
  lvl: number
  isBuiltIn?: boolean
}
type ParentChoiceGroup = { name: string; default: string }
type ChoiceGroupWithParent = ChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }
