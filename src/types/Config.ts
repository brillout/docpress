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
  }
  logoUrl?: string
  faviconUrl?: string
  algolia: null | {
    appId: string
    apiKey: string
    indexName: string
  }
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
  /** Sets `<meta name="description" content="${tagline}" />` */
  tagline: string
  websiteUrl: string
  bannerUrl?: string
  twitterHandle: string
  globalNote?: React.ReactNode
  i18n?: true
  pressKit?: true
  sponsorGithubAccount?: string
  navMaxWidth?: number
  navLogoSize?: number
  navLogoTextStyle?: React.CSSProperties
}
