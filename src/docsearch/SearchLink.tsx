export { SearchLink }

import React, { useEffect, useState } from 'react'
import { openDocsearchModal } from './toggleDocsearchModal.js'
import './SearchLink.css'

type PropsAnchor = React.HTMLProps<HTMLAnchorElement>
// Styled as a search input, opening Algolia DocSearch
function SearchLink(props: PropsAnchor) {
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
      aria-keyshortcuts="Control+K Meta+K"
    >
      <span className="search-box">
        <SearchIcon />
        <span className="search-box-text">Search</span>
        <ShortcutHint />
      </span>
    </a>
  )
}

// The server doesn't know the platform: render `Ctrl K` and switch to `⌘K` on Apple devices after hydration
function ShortcutHint() {
  const [isApple, setIsApple] = useState(false)
  useEffect(() => {
    setIsApple(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
  }, [])
  return <kbd className="search-box-kbd">{isApple ? '⌘K' : 'Ctrl K'}</kbd>
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
