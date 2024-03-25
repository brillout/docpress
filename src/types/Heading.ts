export { Heading }
export { HeadingDetached }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

import type { EmojiName } from '../utils/server'

type NavItemLevel =
  | NaItemDefinitionLevel
  | {
      level: 3
      url: null | string
    }
type NaItemDefinitionLevel =
  | ({ level: 1; titleEmoji: EmojiName } & IsNavCategory)
  | ({ level: 4 } & IsNavCategory)
  | {
      level: 2
      sectionTitles?: string[]
      url: null | string
    }
type IsNavCategory = {
  url?: undefined
  titleDocument?: undefined
  titleInNav?: undefined
}

type Heading = HeadingCommon & {
  level: number
  title: JSX.Element
  titleInNav: JSX.Element
  headingsBreadcrumb: JSX.Element[]
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
  NaItemDefinitionLevel & {
    title: string
    // TODO: rename to titleNav
    titleInNav?: string
  }
type HeadingCommon = {
  url?: null | string
  // TODO: rename to titlePage
  titleDocument?: string
}
