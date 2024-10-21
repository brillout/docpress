export { MenuModal }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'
import { NavigationFullscreenClose } from '../navigation/navigation-fullscreen/NavigationFullscreenButton'
import { css } from '../utils/css'
import { containerQueryMobile } from './Layout'

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
          backgroundColor: 'white',
        }}
      >
        <div
          id="menu-modal-content"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <NavigationFullscreenClose />
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
