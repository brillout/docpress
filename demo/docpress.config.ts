export { config }

import type { Config } from '@brillout/docpress'
import logoUrl from './images/logo.svg'
import { headings, headingsDetached } from './headings'

const config: Config = {
  projectInfo: {
    projectName: 'DocPress Demo' as const,
    projectVersion: '0.0.0',
    githubRepository: 'https://github.com/brillout/docpress' as const,
    githubIssues: 'https://github.com/brillout/docpress/issues/new' as const,
    twitterProfile: 'https://twitter.com/brillout' as const,
    discordInvite: 'https://example.org/some-discord-invite',
  },
  faviconUrl: logoUrl,
  algolia: {
    appId: 'FAKE_ID',
    apiKey: 'FAKE_KEY',
    indexName: 'FAKE_INDEX',
  },
  i18n: true,
  pressKit: true,
  tagline: 'DocPress Demo',
  headings,
  headingsDetached,
  topNavigationStyle: {
    marginTop: 10,
  },
  websiteUrl: 'fake-website.example.org',
  twitterHandle: 'fake-twitter-handle',
  // globalNote: <GlobalNoteWarning />,
}

/*
function GlobalNoteWarning() {
  return (
    <>
      <div style={{ maxWidth: 500, margin: 'auto' }}>
        <Warning>Some global note.</Warning>
      </div>
    </>
  )
}
*/
