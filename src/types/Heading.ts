export type { HeadingResolved }
export type { HeadingDetachedResolved }
export type { HeadingDetachedDefinition }
export type { HeadingDefinition }
export type { StringArray }

type HeadingResolved = {
  url?: null | string
  level: number
  title: string
  titleInNav: string
  linkBreadcrumb: StringArray
  sectionTitles?: StringArray
  menuModalFullWidth?: true
  pageDesign?: PageDesign
  category?: string
  color?: string
  titleIcon?: string
  titleDocument?: string
  description?: string
}

type StringArray = string[] | readonly string[]

type PageDesign = {
  hideTitle?: true
  hideMenuLeft?: true
  contentMaxWidth?: number
  /**
   * Whether the top navigation sticks to the top of the viewport while scrolling.
   *
   * @default true
   */
  topNavSticky?: boolean
}

type HeadingDetachedResolved = Omit<HeadingResolved, 'level' | 'linkBreadcrumb'> & {
  level: 2
  linkBreadcrumb: null
}

type HeadingDefinitionCommon = {
  title: string
  menuModalFullWidth?: true
  pageDesign?: PageDesign
}

type HeadingDetachedDefinition = HeadingDefinitionCommon & {
  url: string
  sectionTitles?: StringArray
  category?: string
}

type HeadingDefinition = HeadingDefinitionCommon & {} & (
    | ({
        level: 1
        color: string
        titleIcon?: string
        /** What the category covers, in a sentence: shown on the docs home (`<DocsOverview>`) */
        description?: string
      } & IsCategory)
    | ({ level: 4 } & IsCategory)
    | {
        level: 2
        titleInNav?: string
        titleDocument?: string
        sectionTitles?: StringArray
        url: null | string
      }
  )
type IsCategory = {
  url?: undefined
  titleInNav?: undefined
}
