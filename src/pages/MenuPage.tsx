export { MenuFull as Page }
export { MenuFullModal }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'
import { NavigationFullscreenClose } from '../navigation/navigation-fullscreen/NavigationFullscreenButton'
import { Wrapper } from '../renderer/getPageElement'
import './MenuFullModal.css'

function MenuFull() {
  const pageContext = usePageContext()
  const navItems = pageContext.navItemsAll.filter((navItem) => navItem.level <= 2)
  return (
    <div id="menu-full-content">
      <NavigationFullscreenClose />
      <NavigationContent navItems={navItems} />
    </div>
  )
}

function MenuFullModal(props: Omit<Parameters<typeof Wrapper>[0], 'children'>) {
  return (
    <Wrapper {...props}>
      <div
        id="menu-full-modal"
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
        <MenuFull />
      </div>
    </Wrapper>
  )
}
