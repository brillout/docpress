export { ExternalLinks }

import React from 'react'
import iconGithub from './icons/github.svg'
import iconTwitter from './icons/twitter.svg'
import iconDiscord from './icons/discord.svg'
import iconBluesky from './icons/bluesky.svg'
import iconLinkedin from './icons/linkedin.svg'
import iconChangelog from './icons/changelog.svg'
import iconLanguages from './icons/languages.svg'
import { usePageContext } from './renderer/usePageContext'
import '@docsearch/css'

function ExternalLinks(props: { style?: React.CSSProperties }) {
  const pageContext = usePageContext()
  const { github, discord, bluesky, linkedin, i18n, twitter, changelog } = pageContext.globalContext.config.docpress
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
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...props.style,
      }}
    >
      {iconI18n}
      {discord && <LinkIcon className="decolorize-6" icon={iconDiscord} href={discord} />}
      {twitter && <LinkIcon className="decolorize-4" icon={iconTwitter} href={`https://x.com/${twitter.slice(1)}`} />}
      {bluesky && <LinkIcon className="decolorize-6" icon={iconBluesky} href={`https://bsky.app/profile/${bluesky}`} />}
      {linkedin && (
        <LinkIcon className="decolorize-6" icon={iconLinkedin} href={`https://www.linkedin.com/company/${linkedin}`} />
      )}
      <LinkIcon className="decolorize-4" icon={iconGithub} href={github} />
      {changelog !== false && <ChangelogButton />}
    </div>
  )
}

function ChangelogButton() {
  const pageContext = usePageContext()
  const { version, github } = pageContext.globalContext.config.docpress
  return (
    <a
      href={`${github}/blob/main/CHANGELOG.md`}
      className="colorize-on-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 5px',
        height: '100%',
      }}
    >
      <div
        className="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '2px 10px',
          fontSize: '0.97em',
        }}
      >
        <span id="version-number" className="decolorize-7">
          v{version}
        </span>
        <img className="decolorize-6" src={iconChangelog} height={16} style={{ marginLeft: 6 }} />
      </div>
    </a>
  )
}

function LinkIcon({ className, icon, href, style }: { className: string; icon: string; href: string; style?: any }) {
  return (
    <>
      <a
        className="colorize-on-hover"
        href={href}
        style={{ padding: 5, display: 'inline-flex', lineHeight: 0, height: '100%', alignItems: 'center' }}
      >
        <img className={className} src={icon} height="20" style={style} />
      </a>
    </>
  )
}
