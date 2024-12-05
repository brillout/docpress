export { SearchLink }

import React from 'react'
import { openDocsearchModal } from './toggleDocsearchModal'

type PropsAnchor = React.HTMLProps<HTMLAnchorElement>
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
      className={['colorize-on-hover', props.className].filter(Boolean).join(' ')}
      onClick={(ev) => {
        ev.preventDefault()
        openDocsearchModal()
      }}
      aria-label={'Ctrl\xa0+\xa0K'}
    >
      <SearchIcon />
      Search
    </a>
  )
}
function SearchIcon() {
  return (
    <span style={{ marginRight: 'var(--icon-text-padding)', fontSize: '1.1em' }} className="decolorize-7 desktop-fade">
      🔍
    </span>
  )
}
