export { HeadingResolved }
export { HeadingDetachedResolved }
export { HeadingDetachedDefinition }
export { HeadingDefinition }

type HeadingResolved = {
  url?: null | string
  level: number
  title: string
  titleInNav: string
  topNavigation?: true | string
  linkBreadcrumb: string[]
  sectionTitles?: string[]
  menuModalFullWidth?: true
} & Tmp

type HeadingDetachedResolved = Omit<HeadingResolved, 'level' | 'linkBreadcrumb'> & {
  level: 2
  linkBreadcrumb: null
}

type HeadingDefinitionCommon = {
  title: string
  topNavigation?: true | string
  menuModalFullWidth?: true
}

type HeadingDetachedDefinition = HeadingDefinitionCommon & {
  url: string
  sectionTitles?: string[]
}

type HeadingDefinition = HeadingDefinitionCommon & {
  url?: null | string
  titleInNav?: string
} & HeadingDefinitionLevel &
  Tmp
type IsCategory = {
  url?: undefined
  titleDocument?: undefined
  titleInNav?: undefined
}
type HeadingDefinitionLevel =
  | ({ level: 1 } & IsCategory)
  | ({ level: 4 } & IsCategory)
  | {
      level: 2
      sectionTitles?: string[]
      url: null | string
    }

type Tmp = {
  // TODO: remove? Both Vike and Telefunc set it to the same value than docpress.config.js#projectInfo.projectName
  titleDocument?: string
}
