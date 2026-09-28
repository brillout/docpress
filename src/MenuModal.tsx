export { MenuModal }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { css } from './utils/css.js'
import { cls } from './utils/cls.js'
import { bodyMaxWidth, viewDesktop, viewTablet, viewMobile, scrollFadeMask } from './Layout.js'
import { ExternalLinks } from './ExternalLinks.js'
import { Style } from './utils/Style.js'
import { NavigationWithColumnLayout } from './MenuModal/NavigationWithColumnLayout.js'
import {
  closeMenuModalAndFocusToggle,
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
        // `menu-modal-framed`: capped to the frame's width (its rounded corners, see below)
        className={cls([
          'link-hover-animation add-transition show-on-nav-hover',
          !isNavLeftAlwaysHidden_ && 'menu-modal-framed',
        ])}
        style={{
          // Absolute inside the sticky header so the dropdown tracks the nav on scroll
          position: 'absolute',
          width: '100%',
          top: 'var(--nav-head-height)',
          zIndex: 199, // maximum value, because docsearch's modal has `z-index: 200`
          background: 'var(--dp-color-bg)',
          // `visibility`: hidden once closed (out of the tab order), visible for the whole closing transition
          transitionProperty: 'opacity, visibility',
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
        {/* First: the first focus stop of the (mobile) dialog */}
        <CloseButton className="show-only-on-mobile" />
        <div
          id="menu-modal-scroll-container"
          className="scroll-fade"
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
              <ExternalLinks style={{ height: 50 }} withThemeToggle={false} />
            </div>
            <Center>
              <EditLink className="menu-edit-link">Edit this page</EditLink>
            </Center>
          </div>
        </div>
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
.menu-edit-link {
  margin: 8px 0 20px;
}
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

html:not(.menu-modal-show) #menu-modal-wrapper {
  visibility: hidden;
}
${/* Opening: visible at once (e.g. to move the focus inside) */ ''}
html.menu-modal-show #menu-modal-wrapper {
  transition-property: opacity !important;
  transition-duration: var(--dp-duration-reveal) !important;
  transition-timing-function: var(--dp-ease-out) !important;
}

@media (width > ${viewTablet}px) {
  #menu-modal-scroll-container {
    ${/* 16px: the popover's bottom edge (and shadow) stays on screen when the viewport is short */ ''}
    max-height: calc(100vh - var(--nav-head-height) - var(--block-margin) - 16px);
    ${/* https://github.com/brillout/docpress/issues/23 */ ''}
    ${/* https://stackoverflow.com/questions/64514118/css-overscroll-behavior-contain-when-target-element-doesnt-overflow */ ''}
    ${/* https://stackoverflow.com/questions/9538868/prevent-body-from-scrolling-when-a-modal-is-opened */ ''}
    overscroll-behavior: none;
  }
  ${/* A popover hanging from the top bar: its extent reads also where it's narrower than the viewport. Just below the */ ''}
  ${/* top bar's hairline (its own top edge clipped): the hairline runs unbroken. */ ''}
  #menu-modal-wrapper {
    top: calc(var(--nav-head-height) + var(--block-margin)) !important;
    box-shadow: var(--dp-shadow-popover);
    clip-path: inset(0 -40px -60px -40px);
  }
  #border-bottom {
    display: none;
  }
  ${/* The columns (and the categories' color bars) don't touch the popover's sides */ ''}
  .menu-navigation-content {
    padding: 5px 12px 0;
    box-sizing: border-box;
  }
  ${/* Rounded corners only where the popover doesn't reach the viewport's sides (+20px: a classic scrollbar) */ ''}
  @media (width >= ${bodyMaxWidth + 20}px) {
    #menu-modal-wrapper.menu-modal-framed {
      border-radius: 0 0 var(--dp-radius-lg) var(--dp-radius-lg);
    }
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
@media (width <= ${viewTablet}px) {
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
    ${/* The first row lines up with the close button */ ''}
    padding-top: 10px;
  }
  ${/* Tablet: the categories aren't collapsible, their heads have a top margin */ ''}
  @media (width > ${viewMobile}px) {
    #menu-modal-scroll-container {
      padding-top: 5.5px;
    }
  }
  #border-bottom {
    display: none;
  }
  html:not(.menu-modal-show) #menu-modal-wrapper {
    opacity: 0;
    pointer-events: none;
    ${/* Closing is quicker than opening */ ''}
    transition-duration: var(--dp-duration);
  }
  ${/* Disable scrolling of main view */ ''}
  html.menu-modal-show {
    overflow: hidden !important;
    ${/* The page doesn't shift sideways when its (classic) scrollbar goes away */ ''}
    scrollbar-gutter: stable;
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
@container container-viewport (width >= ${viewDesktop}px) {
  #menu-modal-wrapper .nav-item-level-3 {
    display: none;
  }
}
`
}

function CloseButton({ className }: { className: string }) {
  return (
    <button
      type="button"
      className={`menu-modal-close ${className}`}
      onClick={closeMenuModalAndFocusToggle}
      aria-label="Close menu"
    >
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
