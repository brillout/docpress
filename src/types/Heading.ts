export { Heading }
export { HeadingDetached }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

import type { EmojiName } from '../utils/server'

type Heading = Omit<HeadingDefinition, 'title' | 'titleInNav'> & {
  title: JSX.Element
  titleInNav: JSX.Element
  parentHeadings: (Heading | HeadingDetached)[]
  sectionTitles?: string[]
}
type HeadingDetached = Omit<Heading, 'level' | 'parentHeadings'> & {
  level: 2
  parentHeadings: null
}
type HeadingDetachedDefinition = {
  url: string
  title: string | JSX.Element
  sectionTitles?: string[]
}
type HeadingDefinition = HeadingBase &
  (
    | ({ level: 1; titleEmoji: EmojiName } & HeadingAbstract)
    | ({ level: 4 } & HeadingAbstract)
    | {
        level: 2
        sectionTitles?: string[]
        url: null | string
      }
    | {
        level: 3
        url: null | string
      }
  )
type HeadingBase = {
  title: string
  level: number
  url?: null | string
  titleDocument?: string
  titleInNav?: string
  // titleSize?: string
}
type HeadingAbstract = {
  url?: undefined
  titleDocument?: undefined
  titleInNav?: undefined
}
