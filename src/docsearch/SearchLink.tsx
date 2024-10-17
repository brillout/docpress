export { SearchLink }

import React from 'react'
import { openDocsearchModal } from '../algolia/closeDocsearchModal'

type PropsDiv = React.HTMLProps<HTMLDivElement>
function SearchLink(props: PropsDiv) {
  return (
    <div
      {...props}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        ...props.style,
      }}
      className="colorize-on-hover"
      onClick={(ev) => {
        ev.preventDefault()
        openDocsearchModal()
      }}
      aria-label="Ctrl + K"
      data-balloon-pos="left"
      data-balloon-blunt
      data-balloon-nofocus
    >
      <SearchIcon />
      Search
    </div>
  )
}
function SearchIcon() {
  const size = '1.9em'
  return (
    <svg
      style={{ paddingRight: 11, lineHeight: 0, width: size, height: size }}
      className="decolorize-6"
      viewBox="0 0 20 20"
    >
      <path
        d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      ></path>
    </svg>
  )
}