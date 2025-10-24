export type { MenuResolved }
export type { MenuDetachedResolved }
export type { MenuDetachedDefinition }
export type { MenuDefinition }
export type { StringArray }

type MenuResolved = {
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

type MenuDetachedResolved = Omit<MenuResolved, 'level' | 'linkBreadcrumb'> & {
  level: 2
  linkBreadcrumb: null
}

type MenuDefinitionCommon = {
  title: string
  menuModalFullWidth?: true
  pageDesign?: PageDesign
}

type MenuDetachedDefinition = MenuDefinitionCommon & {
  url: string
  sectionTitles?: StringArray
  category?: string
}

type MenuDefinition = MenuDefinitionCommon & {} & (
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
