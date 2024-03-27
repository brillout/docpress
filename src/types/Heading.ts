export { HeadingResolved }
export { HeadingDetachedResolved }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

import type { EmojiName } from '../utils/server'

type HeadingResolved = HeadingCommon & {
  level: number
  title: JSX.Element
  titleInNav: JSX.Element
  linkBreadcrumb: JSX.Element[]
  sectionTitles?: string[]
}
type HeadingDetachedResolved = Omit<HeadingResolved, 'level' | 'linkBreadcrumb'> & {
  level: 2
  linkBreadcrumb: null
}

type HeadingDetachedDefinition = {
  url: string
  title: string | JSX.Element
  sectionTitles?: string[]
}

type HeadingDefinition = HeadingCommon &
  HeadingDefinitionLevel & {
    title: string
    titleInNav?: string
  }
type IsCategory = {
  url?: undefined
  titleDocument?: undefined
  titleInNav?: undefined
}
type HeadingDefinitionLevel =
  | ({ level: 1; titleEmoji: EmojiName } & IsCategory)
  | ({ level: 4 } & IsCategory)
  | {
      level: 2
      sectionTitles?: string[]
      url: null | string
    }

type HeadingCommon = {
  url?: null | string
  // TODO: remove? Both Vike and Telefunc set it to the same value than docpress.config.js#projectInfo.projectName
  titleDocument?: string
}
