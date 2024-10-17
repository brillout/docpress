export { SearchLink }

import React from 'react'
import { openDocsearchModal } from '../algolia/closeDocsearchModal'

function SearchLink() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        cursor: 'pointer',
      }}
      onClick={(ev) => {
        ev.preventDefault()
        openDocsearchModal()
      }}
    >
      <SearchIcon />
      <span style={{ marginLeft: 7 }}>Search</span>
    </div>
  )
}

function SearchIcon(props: React.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" {...props}>
      <path
        d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  )
}
