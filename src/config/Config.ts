export type { Config }

import type { HeadingDefinition, HeadingWithoutLink } from '../headings'

type Config = {
  projectInfo: {
    githubRepository: string
    githubIssues: string
    projectName: string
    projectVersion: string
    discordInvite: string
    twitterProfile: string
  }
  faviconUrl: string
  algolia: null | {
    appId: string
    apiKey: string
    indexName: string
  }
  headings: HeadingDefinition[]
  headingsWithoutLink: HeadingWithoutLink[]
  navHeaderMobile: React.ReactNode
  navHeader: React.ReactNode
  titleNormalCase: boolean
  tagline: string
  websiteUrl: string
  bannerUrl?: string
  twitterHandle: string
}
