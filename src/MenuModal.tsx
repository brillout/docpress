export { MenuModal }
export { toggleMenuModal }
export { closeMenuModal }
export { hotkeyMenuOpen }
export { hotkeyMenuClose }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { NavigationContent } from './navigation/Navigation'
import { css } from './utils/css'
import { containerQueryMobile } from './Layout'

const hotkeyMenuOpen = 'Ctrl + M'
const hotkeyMenuClose = 'Ctrl+M or Escape'

function MenuModal() {
  const pageContext = usePageContext()
  const navItems = pageContext.navItemsAll
  return (
    <>
      <style>{getStyle()}</style>
      <div
        id="menu-modal"
        style={{
          position: 'fixed',
          width: '100%',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 9999,
          overflow: 'scroll',
          background: 'var(--bg-color)',
        }}
      >
        <div
          id="menu-modal-content"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CloseButton />
          <NavigationContent
            navItems={navItems}
            style={{
              flexGrow: 1,
              marginTop: -25,
              columnGap: 20,
            }}
            styleGroups={{
              breakInside: 'avoid',
              width: '100%',
            }}
          />
        </div>
      </div>
    </>
  )

  function getStyle() {
    return css`
html:not(.menu-modal-show) #menu-modal {
  display: none;
}
// disable scroll of main view
html.menu-modal-show {
  overflow: hidden !important;
}
@container(min-width: ${containerQueryMobile}px) {
  #menu-modal-content .nav-item-level-3 {
    display: none;
  }
}
`
  }
}

function CloseButton() {
  return (
    <a
      onClick={toggleMenuModal}
      style={{ position: 'absolute', top: 11, right: 11, zIndex: 10 }}
      aria-label={hotkeyMenuClose}
      data-balloon-pos="left"
      data-balloon-blunt
      data-balloon-nofocus
    >
      <svg width="48.855" height="48.855" version="1.1" viewBox="0 0 22.901 22.901" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="11.45"
          cy="11.45"
          r="10.607"
          fill="#ececec"
          stroke="#666"
          strokeDashoffset="251.44"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6875"
          style={{ paintOrder: 'normal' }}
        />
        <path
          d="m7.5904 6.2204 3.86 3.86 3.84-3.84a0.92 0.92 0 0 1 0.66-0.29 1 1 0 0 1 1 1 0.9 0.9 0 0 1-0.27 0.66l-3.89 3.84 3.89 3.89a0.9 0.9 0 0 1 0.27 0.61 1 1 0 0 1-1 1 0.92 0.92 0 0 1-0.69-0.27l-3.81-3.86-3.85 3.85a0.92 0.92 0 0 1-0.65 0.28 1 1 0 0 1-1-1 0.9 0.9 0 0 1 0.27-0.66l3.89-3.84-3.89-3.89a0.9 0.9 0 0 1-0.27-0.61 1 1 0 0 1 1-1c0.24 3e-3 0.47 0.1 0.64 0.27z"
          fill="#666"
          stroke="#666"
          strokeWidth=".11719"
        />
      </svg>
    </a>
  )
}

function toggleMenuModal() {
  document.documentElement.classList.toggle('menu-modal-show')
}
function closeMenuModal() {
  document.documentElement.classList.remove('menu-modal-show')
}