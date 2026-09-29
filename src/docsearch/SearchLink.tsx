export { SearchLink }

import React from 'react'
import { openDocsearchModal } from './toggleDocsearchModal.js'
import './SearchLink.css'

type PropsAnchor = React.HTMLProps<HTMLAnchorElement>
// Styled as a search input, opening Algolia DocSearch
function SearchLink({ label = 'Search', ...props }: PropsAnchor & { label?: string }) {
  return (
    <a
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        ...props.style,
      }}
      className={['search-link', props.className].filter(Boolean).join(' ')}
      onClick={(ev) => {
        ev.preventDefault()
        openDocsearchModal()
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-keyshortcuts="Control+K Meta+K"
      onKeyDown={(ev) => {
        if (ev.key !== 'Enter' && ev.key !== ' ') return
        ev.preventDefault()
        openDocsearchModal()
      }}
    >
      <span className="search-box">
        <SearchIcon />
        <span className="search-box-text">{label}</span>
        <ShortcutHint />
      </span>
    </a>
  )
}

// The server doesn't know the platform: both are rendered, and CSS shows `⌘K` on Apple devices (the `dp-apple` class is
// set before the first paint, see onRenderHtml.tsx): the hint doesn't change after hydration
function ShortcutHint() {
  return (
    <kbd className="search-box-kbd">
      <span className="search-box-kbd-other">Ctrl K</span>
      <span className="search-box-kbd-apple">⌘K</span>
    </kbd>
  )
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
