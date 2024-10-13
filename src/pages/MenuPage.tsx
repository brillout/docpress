export { MenuFull as Page }
export { MenuFullModal }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'
import { NavigationFullscreenClose } from '../navigation/navigation-fullscreen/NavigationFullscreenButton'
import { Wrapper } from '../renderer/getPageElement'
import './ManuFullModal.css'

function MenuFull() {
  const pageContext = usePageContext()
  const { navigationData } = pageContext
  const { currentUrl } = navigationData
  const navItems = navigationData.navItemsAll.filter((navItem) => navItem.level <= 2)
  return (
    <div id="menu-full-content" style={{ color: 'pink' }}>
      <NavigationFullscreenClose />
      <NavigationContent navItems={navItems} currentUrl={currentUrl} />
    </div>
  )
}

function MenuFullModal(props: Omit<Parameters<typeof Wrapper>[0], 'children'>) {
  return (
    <Wrapper {...props}>
      <div
        id="menu-full-modal"
        className="menu-full-modal-hide"
        style={{
          width: '100%',
          height: '100vh',
          position: 'fixed',
          zIndex: 9999,
          top: 0,
          left: 0,
          backgroundColor: 'white',
        }}
      >
        <MenuFull />
      </div>
    </Wrapper>
  )
}
