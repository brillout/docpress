export type { ChoiceGroup, ChoiceGroupWithParent, ParentChoiceGroup }

import type { Config, ChoiceItem } from '../types/Config.js'

type ChoiceGroup = Omit<NonNullable<Config['choices']>[string], 'choices'> & {
  name: string
  choices: ChoiceItem[]
  emptyChoices: string[]
  hidden: boolean
  lvl: number
  isBuiltIn?: boolean
}
type ParentChoiceGroup = { name: string; default: string }
type ChoiceGroupWithParent = ChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }
