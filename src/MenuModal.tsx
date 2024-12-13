export { MenuModal }

import React, { useEffect, useState } from 'react'
import { usePageContext } from './renderer/usePageContext'
import { css } from './utils/css'
import { blockMargin, containerQueryMobileLayout, containerQueryMobileMenu } from './Layout'
import { NavSecondaryContent } from './NavSecondaryContent'
import { Style } from './utils/Style'
import { NavigationWithColumnLayout } from './MenuModal/NavigationWithColumnLayout'
import { addListenerOpenMenuModal, closeMenuModal, keepMenuModalOpen } from './MenuModal/toggleMenuModal'

function MenuModal({ isTopNav }: { isTopNav: boolean }) {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    addListenerOpenMenuModal(() => {
      const { scrollHeight } = document.getElementById('menu-modal-scroll-container')!
      const heightNew = scrollHeight + blockMargin
      if (height !== heightNew) setHeight(heightNew)
    })
  })
  return (
    <>
      <Style>{getStyle()}</Style>
      <div
        id="menu-modal-wrapper"
        className="link-hover-animation add-transition show-on-nav-hover"
        style={{
          position: isTopNav ? 'absolute' : 'fixed',
          width: '100%',
          top: 'var(--nav-head-height)',
          left: 0,
          zIndex: 199, // maximum value, because docsearch's modal has `z-index: 200`
          background: '#ededef',
          transitionProperty: 'height, opacity',
          transitionTimingFunction: 'ease',
          height,
          overflow: 'hidden',
        }}
        onMouseOver={() => keepMenuModalOpen()}
        onMouseLeave={closeMenuModal}
      >
        <div
          id="menu-modal-scroll-container"
          style={{
            overflowY: 'scroll',
            // https://github.com/brillout/docpress/issues/23
            // https://stackoverflow.com/questions/64514118/css-overscroll-behavior-contain-when-target-element-doesnt-overflow
            // https://stackoverflow.com/questions/9538868/prevent-body-from-scrolling-when-a-modal-is-opened
            overscrollBehavior: 'none',
            // We don't set `container` to the parent #menu-modal-wrapper beacuse of a Chrome bug (showing a blank <MenuModal>). Edit: IIRC because #menu-modal-wrapper has `position: fixed`.
            container: 'container-viewport / inline-size',
          }}
        >
          <Nav />
          <NavSecondary className="show-only-for-mobile" />
        </div>
        <BorderBottom />
        <CloseButton className="show-only-for-mobile" />
      </div>
    </>
  )
}
function BorderBottom() {
  return (
    <div
      id="border-bottom"
      style={{
        position: 'absolute',
        background: '#fff',
        height: 'var(--block-margin)',
        width: '100%',
        bottom: 0,
        zIndex: 200,
      }}
    />
  )
}
function Nav() {
  const pageContext = usePageContext()
  const navItems = pageContext.navItemsAll
  return <NavigationWithColumnLayout navItems={navItems} />
}
function NavSecondary({ className }: { className: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 10,
      }}
    >
      <NavSecondaryContent style={{ height: 70 }} />
    </div>
  )
}

function getStyle() {
  return css`
@media(min-width: ${containerQueryMobileMenu + 1}px) {
  #menu-modal-scroll-container,
  #menu-modal-wrapper {
    max-height: calc(100vh - var(--nav-head-height));
  }
  html:not(.menu-modal-show) #menu-modal-wrapper {
    ${/* 3px */ ''}
    height: var(--block-margin) !important;
    pointer-events: none;
  }
  .show-only-for-mobile {
    display: none !important;
  }
}
@media(max-width: ${containerQueryMobileMenu}px) {
  #menu-modal-scroll-container {
    ${/* Fallback for Firefox: it doesn't support `dvh` yet: https://caniuse.com/?search=dvh */ ''}
    ${/* Let's always and systematically use `dvh` instead of `vh` once Firefox supports it */ ''}
    height:  calc(100vh) !important;
    ${/* We use dvh because of mobile */ ''}
    ${/* https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser/72245072#72245072 */ ''}
    height: calc(100dvh) !important;
    ${/* Place <NavSecondary /> to the bottom */ ''}
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  #border-bottom {
    display: none;
  }
  html:not(.menu-modal-show) #menu-modal-wrapper {
    opacity: 0;
    pointer-events: none;
  }
  ${/* Disable scrolling of main view */ ''}
  html.menu-modal-show {
    overflow: hidden !important;
  }
  #menu-modal-wrapper {
    --nav-head-height: 0px !important;
  }
}
@container container-viewport (min-width: ${containerQueryMobileLayout}px) {
  #menu-modal-wrapper .nav-item-level-3 {
    display: none;
  }
}
`
}

function CloseButton({ className }: { className: string }) {
  return (
    <div
      className={className}
      onClick={closeMenuModal}
      style={{ position: 'fixed', top: 0, right: 0, zIndex: 10, padding: 11, cursor: 'pointer' }}
      aria-label={'Escape\nCtrl\xa0+\xa0M'}
      data-label-shift
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
    </div>
  )
}
