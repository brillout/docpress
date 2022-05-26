import type { Config } from 'vikepress'
import React from 'react'
import logoUrl from './images/logo.svg'
import { headings, headingsWithoutLink } from './headings'

export default {
  projectInfo: {
    projectName: 'Vikepress Demo' as const,
    projectVersion: '0.0.0',
    githubRepository: 'https://github.com/brillout/vikepress' as const,
    githubIssues: 'https://github.com/brillout/vikepress/issues/new' as const,
    discordInvite: 'https://discord.com/invite/dSDMGGJZQy' as const,
    twitterProfile: 'https://twitter.com/brillout' as const
  },
  faviconUrl: logoUrl,
  algolia: null,
  navHeaderMobile: <NavHeaderMobile />,
  navHeader: <NavHeader />,
  tagline: 'Vikepress Demo',
  titleNormalCase: true,
  headings,
  headingsWithoutLink
} as Config

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
        marginLeft
      }}
    >
      {'Vikepress Demo'}
    </span>
  )
}
