export { Page }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'
import { NavigationFullscreenClose } from '../navigation/navigation-fullscreen/NavigationFullscreenButton'

function Page() {
  const pageContext = usePageContext()
  const { navigationData } = pageContext
  const { navItemsAll, currentUrl } = navigationData
  return (
    <div id="menu-full" style={{ color: 'pink' }}>
      <NavigationFullscreenClose />
      <NavigationContent navItems={navItemsAll} currentUrl={currentUrl} />
      {/*
      {navigationData.navItemsAll.map((navItem, i) => {
        return <div key={i}>{navItem.title}</div>
      })}
      */}
    </div>
  )
}
