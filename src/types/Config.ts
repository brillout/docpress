export type { Config, MenuConfig }

import type { MenuDefinition, MenuDetachedDefinition } from './Heading'

type Config = {
  name: string
  version: string
  url: string
  /** Sets `<meta name="description" content="${tagline}" />` */
  tagline: string
  logo: string
  favicon?: string
  banner?: string

  github: string
  discord?: string
  twitter?: string
  bluesky?: string
  linkedin?: string
  changelog?: boolean

  categories?: Category[]

  algolia?: {
    appId: string
    apiKey: string
    indexName: string
  }
  googleAnalytics?: string

  i18n?: true
  pressKit?: true
  docsDir?: string
  navMaxWidth?: number

  topNavigation?: React.ReactNode

  navLogo?: React.ReactNode
  navLogoSize?: number
  navLogoStyle?: React.CSSProperties
  navLogoTextStyle?: React.CSSProperties

  globalNote?: React.ReactNode
}

type MenuConfig = {
  menusMain: MenuDefinition[]
  menusDetached: MenuDetachedDefinition[]
}

/** Order in Algolia search results */
type Category =
  | string
  | {
      name: string
      /** Hide from Algolia search */
      hide?: boolean
    }
