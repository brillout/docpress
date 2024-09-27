export { Page }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { NavigationContent } from '../navigation/Navigation'

function Page() {
  const pageContext = usePageContext()
  const { navigationData } = pageContext
  const { navItemsAll, currentUrl } = navigationData
  return (
    <div id="menu-full" style={{ color: 'pink' }}>
      <NavigationContent id="navigation-content-main" navItems={navItemsAll} currentUrl={currentUrl} />
      {/*
      {navigationData.navItemsAll.map((navItem, i) => {
        return <div key={i}>{navItem.title}</div>
      })}
      */}
    </div>
  )
}
