export { ExternalLinks }

import React from 'react'
import iconGithub from './icons/github.svg'
import iconTwitter from './icons/twitter.svg'
import iconDiscord from './icons/discord.svg'
import iconBluesky from './icons/bluesky.svg'
import iconLinkedin from './icons/linkedin.svg'
import iconLanguages from './icons/languages.svg'
import { usePageContext } from './renderer/usePageContext.js'
import '@docsearch/css'
import { ThemeToggle } from './theme/ThemeToggle.js'
import './ExternalLinks.css'

function ExternalLinks(props: { style?: React.CSSProperties }) {
  const pageContext = usePageContext()
  const { github, discord, bluesky, linkedin, i18n, twitter, changelog, darkMode } =
    pageContext.globalContext.config.docpress
  const iconI18n = !i18n ? null : (
    <LinkIcon
      className="decolorize-4"
      mono
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
      <LinkIcon className="decolorize-4" mono icon={iconGithub} href={github} iconSizeBoost={1} />
      {iconI18n}
      {discord && <LinkIcon className="decolorize-6" icon={iconDiscord} href={discord} />}
      {twitter && (
        <LinkIcon className="decolorize-4" mono icon={iconTwitter} href={`https://x.com/${twitter.slice(1)}`} />
      )}
      {bluesky && <LinkIcon className="decolorize-6" icon={iconBluesky} href={`https://bsky.app/profile/${bluesky}`} />}
      {linkedin && (
        <LinkIcon className="decolorize-6" icon={iconLinkedin} href={`https://www.linkedin.com/company/${linkedin}`} />
      )}
      {changelog !== false && <ChangelogButton />}
      {darkMode && <ThemeToggle />}
    </div>
  )
}

function ChangelogButton() {
  const pageContext = usePageContext()
  const { version, github, changelog } = pageContext.globalContext.config.docpress
  const changeLogUrl = typeof changelog === 'string' ? changelog : `${github}/blob/main/CHANGELOG.md`
  return (
    <a href={changeLogUrl} className="version-badge" aria-label="Changelog">
      <span id="version-number">v{version}</span>
    </a>
  )
}

function LinkIcon({
  className,
  icon,
  href,
  style,
  iconSizeBoost = 0,
  mono,
}: { className: string; icon: string; href: string; style?: any; iconSizeBoost?: number; mono?: true }) {
  const height = 18 + iconSizeBoost

  return (
    <>
      <a className={mono ? 'icon-button colorize-on-hover dp-icon-mono' : 'icon-button colorize-on-hover'} href={href}>
        <img className={className} src={icon} height={height} style={{ ...style, height }} />
      </a>
    </>
  )
}
