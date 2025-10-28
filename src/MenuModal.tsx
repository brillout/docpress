export { MenuModal }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { css } from './utils/css'
import { viewDesktop, viewTablet } from './Layout'
import { ExternalLinks } from './ExternalLinks'
import { Style } from './utils/Style'
import { NavigationWithColumnLayout } from './MenuModal/NavigationWithColumnLayout'
import { closeMenuModal, closeMenuModalOnMouseLeave, keepMenuModalOpenOnMouseOver } from './MenuModal/toggleMenuModal'
import { EditLink } from './EditLink'

function MenuModal({ isTopNav }: { isTopNav: boolean }) {
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
          transitionProperty: 'opacity',
          transitionTimingFunction: 'ease',
        }}
        onMouseOver={keepMenuModalOpenOnMouseOver}
        onMouseLeave={closeMenuModalOnMouseLeave}
      >
        <div
          id="menu-modal-scroll-container"
          style={{
            overflowX: 'hidden',
            overflowY: 'scroll',
            // We don't set `container` to the parent #menu-modal-wrapper beacuse of a Chrome bug (showing a blank <MenuModal>). Edit: IIRC because #menu-modal-wrapper has `position: fixed`.
            container: 'container-viewport / inline-size',
          }}
        >
          <Nav />
          <div className="show-only-on-mobile">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <ExternalLinks style={{ height: 50 }} />
            </div>
            <EditLink style={{ justifyContent: 'center', padding: 10, marginTop: 0, marginBottom: 13 }} />
          </div>
        </div>
        <CloseButton className="show-only-on-mobile" />
        <BorderBottom />
      </div>
    </>
  )
}
function BorderBottom() {
  return (
    <div
      id="border-bottom"
      style={{
        background: '#fff',
        height: 'var(--block-margin)',
        width: '100%',
      }}
    />
  )
}
function Nav() {
  const pageContext = usePageContext()
  const navItems = pageContext.resolved.navItemsAll
  return <NavigationWithColumnLayout navItems={navItems} />
}

function getStyle() {
  return css`
@media(min-width: ${viewTablet + 1}px) {
  #menu-modal-scroll-container {
    max-height: calc(100vh - var(--nav-head-height) - var(--block-margin));
    ${/* https://github.com/brillout/docpress/issues/23 */ ''}
    ${/* https://stackoverflow.com/questions/64514118/css-overscroll-behavior-contain-when-target-element-doesnt-overflow */ ''}
    ${/* https://stackoverflow.com/questions/9538868/prevent-body-from-scrolling-when-a-modal-is-opened */ ''}
    overscroll-behavior: none;
  }
  html:not(.menu-modal-show) {
    #menu-navigation-container {
      height: 0 !important;
    }
    #menu-modal-wrapper {
      pointer-events: none;
    }
  }
  .show-only-on-mobile {
    display: none !important;
  }
}
@media(max-width: ${viewTablet}px) {
  #menu-modal-scroll-container {
    ${/* Fallback for Firefox: it doesn't support `dvh` yet: https://caniuse.com/?search=dvh */ ''}
    ${/* Let's always and systematically use `dvh` instead of `vh` once Firefox supports it */ ''}
    height:  calc(100vh) !important;
    ${/* We use dvh because of mobile */ ''}
    ${/* https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser/72245072#72245072 */ ''}
    height: calc(100dvh) !important;
    ${/* Place <ExternalLinks> and <EditLink> to the bottom */ ''}
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
  #menu-navigation-container {
    height: auto !important;
  }
  .show-only-on-desktop {
    display: none !important;
  }
  .columns-wrapper {
    width: 100% !important;
  }
}

${/* Hide same-page headings navigation */ ''}
@container container-viewport (min-width: ${viewDesktop}px) {
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
