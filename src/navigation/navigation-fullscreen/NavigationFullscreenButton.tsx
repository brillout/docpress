export { NavigationFullscreenButton }
export { NavigationFullscreenClose }

import React from 'react'
import './NavigationFullscreenButton.css'
import closeIcon from './close.svg'
import { hotkeyLabel } from './hotkeyLabel'

function NavigationFullscreenButton() {
  return (
    <>
      <a id="navigation-fullscreen-button">
        <div
          style={{
            position: 'fixed',
            cursor: 'pointer',
            height: '100vh',
            width: 20,
            overflow: 'hidden',
          }}
        >
          <div></div>
        </div>
        <div
          style={{ position: 'fixed', height: '100vh', width: 20 }}
          aria-label={hotkeyLabel}
          data-balloon-pos="right"
          data-balloon-blunt
        ></div>
      </a>
    </>
  )
}

function NavigationFullscreenClose() {
  return (
    <a
      id="navigation-fullscreen-close"
      style={{ position: 'absolute', top: 11, right: 11, zIndex: 10 }}
      aria-label={hotkeyLabel}
      data-balloon-pos="left"
      data-balloon-blunt
    >
      <img src={closeIcon} height={50} width={50} style={{ display: 'block' }} />
    </a>
  )
}
