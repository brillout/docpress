export { HeadingResolved }
export { HeadingDetachedResolved }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

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
  titleIconStyle?: React.CSSProperties
  titleDocument?: string
}

type StringArray = string[] | readonly string[]

type PageDesign = {
  hideTitle?: true
  hideMenuLeft?: true
  contentMaxWidth?: number
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
    | ({ level: 1; color: string; titleIcon?: string; titleIconStyle?: React.CSSProperties } & IsCategory)
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
