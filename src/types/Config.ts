export type { Config, Choice, ChoiceItem }

import type { HeadingDefinition, HeadingDetachedDefinition } from './Heading.js'
import type React from 'react'

type Config = {
  name: string
  version: string
  url: string
  /** Sets `<meta name="description" content="${tagline}" />` */
  tagline: string
  logo: string
  favicon?:
    | string
    | {
        browser: string
        google: string
      }
  banner?: string

  /**
   * Raw HTML injected at the end of `<head>` on every page.
   *
   * Use for a small inline `<script>`/`<style>` that must run before first
   * paint — e.g. a no-flash theme script that reads a cookie and applies the
   * palette before the page renders (relevant for prerendered/static pages,
   * where there is no request to read the cookie from at render time).
   *
   * Emitted verbatim (not escaped), so only pass trusted, self-authored markup.
   */
  headHtml?: string

  github: string
  discord?: string
  twitter?: string
  bluesky?: string
  linkedin?: string
  changelog?: boolean | string

  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
  categories?: Category[]

  algolia?: {
    appId: string
    apiKey: string
    indexName: string
  }
  googleAnalytics?: string
  umamiId?: string

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
  choices?: Record<string, Choice>
}

/** Order in Algolia search results */
type Category =
  | string
  | {
      name: string
      /** Hide from Algolia search */
      hide?: boolean
    }

/** A choice. A plain `string` is shorthand for `{ name: string }` (no icon). */
type ChoiceItem = {
  name: string
  icon?: string
  iconStyle?: {
    dropdown?: React.CSSProperties
    tab?: React.CSSProperties
  }
}
type Choice = {
  choices: (string | ChoiceItem)[]
  default: string
}
