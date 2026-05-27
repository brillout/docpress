export type { ChoiceGroup, ChoiceGroupWithParent, ParentChoiceGroup }

import type { Config } from '../types/Config.js'

type ChoiceGroup = NonNullable<Config['choices']>[string] & {
  name: string
  emptyChoices: string[]
  hidden: boolean
  lvl: number
}
type ParentChoiceGroup = { name: string; default: string }
type ChoiceGroupWithParent = ChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }
