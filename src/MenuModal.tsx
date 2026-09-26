export { MenuModal }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { css } from './utils/css.js'
import { bodyMaxWidth, viewDesktop, viewTablet, scrollFadeMask } from './Layout.js'
import { ExternalLinks } from './ExternalLinks.js'
import { Style } from './utils/Style.js'
import { NavigationWithColumnLayout } from './MenuModal/NavigationWithColumnLayout.js'
import {
  closeMenuModal,
  closeMenuModalOnMouseLeave,
  keepMenuModalOpenOnMouseOver,
} from './MenuModal/toggleMenuModal.js'
import { EditLink } from './EditLink.js'

function MenuModal({ isNavLeftAlwaysHidden_ }: { isNavLeftAlwaysHidden_: boolean }) {
  return (
    <>
      <Style>{getStyle()}</Style>
      <div
        id="menu-modal-wrapper"
        className="link-hover-animation add-transition show-on-nav-hover"
        style={{
          // Absolute inside the sticky header so the dropdown tracks the nav on scroll
          position: 'absolute',
          width: '100%',
          top: 'var(--nav-head-height)',
          zIndex: 199, // maximum value, because docsearch's modal has `z-index: 200`
          background: 'var(--dp-color-bg)',
          transitionProperty: 'opacity',
          transitionTimingFunction: 'ease',
          maxWidth: isNavLeftAlwaysHidden_ ? undefined : bodyMaxWidth,
          // Horizontal align
          // https://stackoverflow.com/questions/3157372/css-horizontal-centering-of-a-fixed-div/32694476#32694476
          left: '50%',
          transform: 'translateX(-50%)',
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
            ...scrollFadeMask,
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
            <Center>
              <EditLink style={{ justifyContent: 'center', marginTop: 8, marginBottom: 20 }} verbose />
            </Center>
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
        background: 'var(--dp-color-border)',
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
.menu-modal-close {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--dp-radius-md);
  background: var(--dp-color-bg);
  color: var(--dp-color-muted);
  cursor: pointer;
}

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
    <button type="button" className={`menu-modal-close ${className}`} onClick={closeMenuModal} aria-label="Close menu">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )
}

function Center({ style, ...props }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
      {...props}
    ></div>
  )
}
