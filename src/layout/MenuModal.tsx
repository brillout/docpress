export { MenuModal }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'
import { NavigationFullscreenClose } from '../navigation/navigation-fullscreen/NavigationFullscreenButton'
import './MenuModal.css'

function MenuModal() {
  const pageContext = usePageContext()
  const navItems = pageContext.navItemsAll.filter((navItem) => navItem.level <= 2)
  return (
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
      <div id="menu-modal-content">
        <NavigationFullscreenClose />
        <NavigationContent navItems={navItems} />
      </div>
    </div>
  )
}
