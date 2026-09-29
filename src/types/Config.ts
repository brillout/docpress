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

  /**
   * Adds a light/dark/system switch to the top bar.
   *
   * The appearance follows the OS (`prefers-color-scheme`) until the user picks one, which is persisted in `localStorage`.
   *
   * @default false
   */
  darkMode?: boolean

  /**
   * "On this page" rail: show reading progress. The section being read gets a longer rail (as long as the section, in
   * the rail's free height) and the rail's thumb slides down it as the section is read; a ring next to "Back to top"
   * fills as the page is read.
   *
   * @default false
   */
  tocProgress?: boolean

  /**
   * Show the categories (the level-1 headings) as tabs below the top bar, on desktop, instead of the "Docs" menu. Each tab
   * links to its category's first page; the left navigation lists the category's pages.
   *
   * @default false
   */
  categoryTabs?: boolean

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
  /** The icon is black (e.g. a monochrome logo): it's shown white in dark mode */
  iconMono?: boolean
  iconStyle?: React.CSSProperties
  iconStyleDropdown?: React.CSSProperties
  iconStyleTab?: React.CSSProperties
}
type Choice = {
  choices: (string | ChoiceItem)[]
  default: string
  /**
   * Whether to always show the dropdown.
   *
   * @default false
   */
  alwaysShow?: boolean
}
