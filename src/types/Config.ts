export type { Config }

import type { HeadingDefinition, HeadingDetachedDefinition } from './Heading'

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

  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
  categories?: Category[]

  algolia?: {
    appId: string
    apiKey: string
    indexName: string
  }

  i18n?: true
  pressKit?: true
  docsDir?: string

  topNavigation?: React.ReactNode
  globalNote?: React.ReactNode
  navMaxWidth?: number
  navLogoSize?: number
  navLogoStyle?: React.CSSProperties
  navLogoTextStyle?: React.CSSProperties
}

/** Order in Algolia search results */
type Category =
  | string
  | {
      name: string
      /** Hide from Algolia search */
      hide?: boolean
    }
