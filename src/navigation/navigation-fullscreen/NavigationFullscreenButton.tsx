export { NavigationFullscreenButton }
export { NavigationFullscreenClose }

import React from 'react'
import './NavigationFullscreenButton.css'
import closeIcon from './close.svg'

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
            overflow: 'hidden'
          }}
        >
          <div></div>
        </div>
        <div
          style={{ position: 'fixed', height: '100vh', width: 20 }}
          aria-label="Press <Esc>"
          data-balloon-pos="right"
        ></div>
      </a>
    </>
  )
}

function NavigationFullscreenClose() {
  return (
    <a
      id="navigation-fullscreen-close"
      style={{ position: 'fixed', top: 11, right: 15, zIndex: 10 }}
      aria-label="Press <Esc>"
      data-balloon-pos="left"
    >
      <img src={closeIcon} height={50} width={50} style={{ display: 'block' }} />
    </a>
  )
}
