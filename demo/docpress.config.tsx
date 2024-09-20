export { config }

import type { Config } from '@brillout/docpress'
import React from 'react'
import logoUrl from './images/logo.svg'
import { headings, headingsDetached } from './headings'

const config: Config = {
  projectInfo: {
    projectName: 'DocPress Demo' as const,
    projectVersion: '0.0.0',
    githubRepository: 'https://github.com/brillout/docpress' as const,
    githubIssues: 'https://github.com/brillout/docpress/issues/new' as const,
    twitterProfile: 'https://twitter.com/brillout' as const,
  },
  faviconUrl: logoUrl,
  algolia: {
    appId: 'FAKE_ID',
    apiKey: 'FAKE_KEY',
    indexName: 'FAKE_INDEX',
  },
  i18n: true,
  pressKit: true,
  navHeaderMobile: <NavHeaderMobile />,
  navHeader: <NavHeader />,
  tagline: 'DocPress Demo',
  headings,
  headingsDetached,
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

function NavHeaderMobile() {
  const LOGO_SIZE = 40
  return (
    <>
      <img src={logoUrl} height={LOGO_SIZE} width={LOGO_SIZE} />
      <HeaderTitle fontSize={'1.25em'} marginLeft={5} />
    </>
  )
}

function NavHeader() {
  const LOGO_SIZE = 55
  return (
    <>
      <img src={logoUrl} height={LOGO_SIZE} width={LOGO_SIZE} />
      <HeaderTitle fontSize={'1.55em'} marginLeft={10} />
    </>
  )
}

function HeaderTitle({ fontSize, marginLeft }: { fontSize: string; marginLeft: number }) {
  return (
    <span
      style={{
        fontSize,
        padding: '2px 5px',
        marginLeft,
      }}
    >
      {'DocPress Demo'}
    </span>
  )
}
