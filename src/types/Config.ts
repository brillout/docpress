export type { Config }

import type { HeadingDefinition, HeadingDetachedDefinition } from './Heading'

type Config = {
  projectInfo: {
    githubRepository: string
    githubIssues: string
    githubDiscussions?: string
    projectName: string
    projectVersion: string
    discordInvite?: string
    twitterProfile: string
    blueskyHandle?: string
  }
  docsDir?: string
  logoUrl?: string
  faviconUrl?: string
  algolia: null | {
    appId: string
    apiKey: string
    indexName: string
  }
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
  categories?: Category[]
  /** Sets `<meta name="description" content="${tagline}" />` */
  tagline: string
  websiteUrl: string
  bannerUrl?: string
  twitterHandle: string
  globalNote?: React.ReactNode
  topNavigation?: React.ReactNode
  i18n?: true
  pressKit?: true
  sponsorGithubAccount?: string
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
