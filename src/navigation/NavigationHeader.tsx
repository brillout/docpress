import React from 'react'
import iconGithub from '../icons/github.svg'
import iconTwitter from '../icons/twitter.svg'
import iconDiscord from '../icons/discord.svg'
import iconChangelog from '../icons/changelog.svg'
import iconLanguages from '../icons/languages.svg'
import { usePageContext } from '../renderer/usePageContext'

export { NavigationHeader }

function NavigationHeader() {
  const pageContext = usePageContext()
  return (
    <div
      id="navigation-header"
      className={pageContext.config.pressKit && 'press-kit'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -5
      }}
    >
      <a
        id="navigation-header-logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'inherit',
          justifyContent: 'left',
          textDecoration: 'none',
          paddingTop: 12,
          paddingBottom: 7,
          ...pageContext.config.navHeaderWrapperStyle
        }}
        href="/"
      >
        {pageContext.config.navHeader}
      </a>
      <Links />
    </div>
  )
}

function Links() {
  const pageContext = usePageContext()
  const { projectInfo, i18n } = pageContext.config
  const iconI18n = !i18n ? null : (
    <LinkIcon
      className="decolorize-4"
      icon={iconLanguages}
      href={'/languages'}
      style={{ height: 21, position: 'relative', top: 0, left: 0 }}
    />
  )
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: 0,
        justifyContent: 'left'
      }}
    >
      <LinkIcon className="decolorize-4" icon={iconGithub} href={projectInfo.githubRepository} />
      <LinkIcon className="decolorize-6" icon={iconDiscord} href={projectInfo.discordInvite} />
      <LinkIcon className="decolorize-7" icon={iconTwitter} href={projectInfo.twitterProfile} />
      <div className="decolorize-6 colorize-on-hover" id="docsearch-desktop" />
      {iconI18n}
      <ChangelogButton />
    </div>
  )
}

function ChangelogButton() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <a
      href={`${projectInfo.githubRepository}/blob/main/CHANGELOG.md`}
      className="button colorize-on-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1px 7px',
        marginLeft: 2,
        fontSize: '0.97em',
        color: 'inherit'
      }}
    >
      <span id="version-number" className="decolorize-7">
        v{projectInfo.projectVersion}
      </span>
      <img className="decolorize-6" src={iconChangelog} height={16} style={{ marginLeft: 5 }} />
    </a>
  )
}

function LinkIcon({ className, icon, href, style }: { className: string; icon: string; href: string; style?: any }) {
  return (
    <>
      <a
        className={'colorize-on-hover ' + className}
        href={href}
        style={{ padding: 3, display: 'inline-block', lineHeight: 0 }}
      >
        <img src={icon} height="20" style={style} />
      </a>
    </>
  )
}
