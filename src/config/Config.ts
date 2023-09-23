export type { Config }

import type { HeadingDefinition, HeadingDetachedDefinition } from '../parseTitle'

type Config = {
  projectInfo: {
    githubRepository: string
    githubIssues: string
    projectName: string
    projectNameJsx?: JSX.Element
    projectVersion: string
    discordInvite: string
    twitterProfile: string
  }
  faviconUrl: string
  algolia:
    | null
    | {
        PENDING_APPROVAL: true
        appId?: undefined
        apiKey?: undefined
        indexName?: undefined
      }
    | {
        PENDING_APPROVAL?: undefined
        appId: string
        apiKey: string
        indexName: string
      }
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
  navHeaderMobile: React.ReactNode
  navHeader: React.ReactNode
  titleNormalCase: boolean
  tagline: string
  websiteUrl: string
  bannerUrl?: string
  twitterHandle: string
  i18n?: true
}
