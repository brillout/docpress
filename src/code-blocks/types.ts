export type { ChoiceGroup, ChoiceGroupWithParent, ParentChoiceGroup }

import type { Config, ChoiceItem } from '../types/Config.js'

type ChoiceGroup = Omit<NonNullable<Config['choices']>[string], 'choices'> & {
  name: string
  choices: ChoiceItem[]
  // The choices this group doesn't have content for
  emptyChoices: string[]
  // The choices that no group of the page has content for, see getAvailableChoice()
  absentChoices: string[]
  hidden: boolean
  lvl: number
  isBuiltIn?: boolean
}
type ParentChoiceGroup = { name: string; default: string; absentChoices: string[] }
type ChoiceGroupWithParent = ChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }
