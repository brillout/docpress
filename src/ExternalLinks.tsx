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

function ExternalLinks(props: { style?: React.CSSProperties; withThemeToggle?: boolean }) {
  const pageContext = usePageContext()
  const { github, discord, bluesky, linkedin, i18n, twitter, changelog, darkMode } =
    pageContext.globalContext.config.docpress
  const { withThemeToggle = true, ...propsRest } = props
  return (
    <div
      {...propsRest}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...props.style,
      }}
    >
      <LinkIcon icon={iconGithub} href={github} label="GitHub" />
      {i18n && <LinkIcon icon={iconLanguages} href="/languages" label="Languages" />}
      {discord && <LinkIcon icon={iconDiscord} href={discord} label="Discord" brandColor="#5865f2" />}
      {twitter && <LinkIcon icon={iconTwitter} href={`https://x.com/${twitter.slice(1)}`} label="X" />}
      {bluesky && (
        <LinkIcon
          icon={iconBluesky}
          href={`https://bsky.app/profile/${bluesky}`}
          label="Bluesky"
          brandColor="#0085ff"
        />
      )}
      {linkedin && (
        <LinkIcon
          icon={iconLinkedin}
          href={`https://www.linkedin.com/company/${linkedin}`}
          label="LinkedIn"
          brandColor="#0a66c2"
        />
      )}
      {changelog !== false && <ChangelogButton />}
      {darkMode && withThemeToggle && <ThemeToggle className="icon-button" />}
    </div>
  )
}

function ChangelogButton() {
  const pageContext = usePageContext()
  const { version, github, changelog } = pageContext.globalContext.config.docpress
  const changeLogUrl = typeof changelog === 'string' ? changelog : `${github}/blob/main/CHANGELOG.md`
  return (
    <a href={changeLogUrl} className="version-badge scale-on-press" aria-label={`Changelog (v${version})`}>
      v{version}
    </a>
  )
}

// The icon is a mask filled with the text color (it follows the theme); `brandColor` on hover
function LinkIcon({
  icon,
  href,
  label,
  brandColor,
}: { icon: string; href: string; label: string; brandColor?: string }) {
  return (
    <a
      className="icon-button scale-on-press"
      href={href}
      aria-label={label}
      style={{ '--icon': `url("${icon}")`, '--icon-brand-color': brandColor }}
    >
      <span className="icon-button-glyph" />
    </a>
  )
}
