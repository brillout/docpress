export { NavigationFullscreenClose }

// TODO/refactor: move this file

import React from 'react'
import closeIcon from './close.svg'
import { hotkeyLabel } from './hotkeyLabel'
import { toggleMenu } from './initNavigationFullscreen'

function NavigationFullscreenClose() {
  return (
    <a
      onClick={toggleMenu}
      style={{ position: 'absolute', top: 11, right: 11, zIndex: 10 }}
      aria-label={hotkeyLabel}
      data-balloon-pos="left"
      data-balloon-blunt
      data-balloon-nofocus
    >
      <img src={closeIcon} height={50} width={50} style={{ display: 'block' }} />
    </a>
  )
}
