export { Heading }
export { HeadingDetached }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

import type { EmojiName } from '../utils/server'

type MenuItemLevel =
  | MenuItemDefinitionLevel
  | {
      level: 3
      url: null | string
    }
type MenuItemDefinitionLevel =
  | ({ level: 1; titleEmoji: EmojiName } & IsMenuCategory)
  | ({ level: 4 } & IsMenuCategory)
  | {
      level: 2
      sectionTitles?: string[]
      url: null | string
    }
type IsMenuCategory = {
  url?: undefined
  titleDocument?: undefined
  titleInNav?: undefined
}

type Heading = HeadingCommon & {
  title: JSX.Element
  titleInNav: JSX.Element
  headingsBreadcrumb: (Heading | HeadingDetached)[]
  sectionTitles?: string[]
}
type HeadingDetached = Omit<Heading, 'level' | 'headingsBreadcrumb'> & {
  level: 2
  headingsBreadcrumb: null
}
type HeadingDetachedDefinition = {
  url: string
  title: string | JSX.Element
  sectionTitles?: string[]
}
type HeadingDefinition = HeadingCommon &
  MenuItemLevel & {
    title: string
    titleInNav?: string
  }
type HeadingCommon = {
  url?: null | string
  level: number
  titleDocument?: string
}
