export { MenuModal }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { css } from './utils/css.js'
import { bodyMaxWidth, viewDesktop, viewTablet, viewMobile, scrollFadeMask } from './Layout.js'
import { menuPaddingX } from './MenuModal/NavigationWithColumnLayout.js'
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
        className="link-hover-animation show-on-nav-hover"
        style={{ maxWidth: isNavLeftAlwaysHidden_ ? undefined : bodyMaxWidth }}
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
            // Not \`scroll\`: it shows a classic scrollbar (arrows included) also when there's nothing to scroll
            overflowY: 'auto',
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
      </div>
    </>
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
${/* Absolute inside the sticky header, so that the dropdown tracks the nav on scroll. The maximum z-index: DocSearch's modal has 200. */ ''}
#menu-modal-wrapper {
  position: absolute;
  z-index: 199;
}
${/* Closed: out of the tab order, once the closing transition is done (it transitions \`visibility\`) */ ''}
html:not(.menu-modal-show) #menu-modal-wrapper {
  visibility: hidden;
}

@media (width > ${viewTablet}px) {
  ${/* A raised panel floating just below the top bar: centered on its menu's toggle (--menu-anchor, toggleMenuModal.ts), */ ''}
  ${/* sized to its columns (--menu-width, NavigationWithColumnLayout.tsx), kept within the frame */ ''}
  #menu-modal-wrapper {
    top: calc(var(--nav-head-height) + 8px);
    width: var(--menu-width, calc(100% - 32px));
    left: clamp(
      16px,
      var(--menu-anchor, 50%) - var(--menu-width, calc(100% - 32px)) / 2,
      100% - var(--menu-width, calc(100% - 32px)) - 16px
    );
    border-radius: var(--dp-radius-lg);
    background: var(--dp-color-surface-elevated);
    box-shadow: var(--dp-shadow-popover);
  }
  #menu-modal-scroll-container {
    ${/* 8px above, 16px below: the panel's edges (and shadow) stay on screen when the viewport is short */ ''}
    max-height: calc(100vh - var(--nav-head-height) - 24px);
    ${/* https://github.com/brillout/docpress/issues/23 */ ''}
    overscroll-behavior: contain;
    border-radius: inherit;
  }
  ${/* The gap above the panel is part of it: crossing it from the toggle doesn't close the menu */ ''}
  #menu-modal-wrapper::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 9px;
  }
  .menu-navigation-content {
    padding: 20px ${menuPaddingX}px 24px;
  }
  html:not(.menu-modal-show) #menu-modal-wrapper {
    pointer-events: none;
    transition: opacity 250ms ease, visibility 250ms ease;
  }
  ${/* Opening: in place, visible at once (e.g. to move the focus inside) */ ''}
  html.menu-modal-show.menu-modal-display-only-one #menu-modal-wrapper {
    transition: opacity var(--dp-duration-reveal) var(--dp-ease-out);
  }
  ${/* Switching from one menu to another: the panel glides to its toggle and its width */ ''}
  html.menu-modal-show:not(.menu-modal-display-only-one) #menu-modal-wrapper {
    transition: opacity var(--dp-duration-reveal) var(--dp-ease-out), visibility var(--dp-duration-reveal) var(--dp-ease-out),
      left var(--dp-duration-reveal) var(--dp-ease-out), width var(--dp-duration-reveal) var(--dp-ease-out);
  }
}
@media (width <= ${viewTablet}px) {
  ${/* A full-screen dialog */ ''}
  #menu-modal-wrapper {
    top: 0;
    left: 50%;
    width: 100%;
    transform: translateX(-50%);
    background: var(--dp-color-bg);
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
  #menu-modal-scroll-container {
    ${/* The visible viewport (mobile browsers' toolbars come and go) */ ''}
    height: 100dvh;
    ${/* Place <ExternalLinks> and <EditLink> to the bottom */ ''}
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  ${/* The first row lines up with the close button */ ''}
  @media (width <= ${viewMobile}px) {
    #menu-modal-scroll-container {
      padding-top: 10px;
    }
  }
  ${/* Tablet: the categories aren't collapsible, their heads have a top margin */ ''}
  @media (width > ${viewMobile}px) {
    #menu-modal-scroll-container {
      padding-top: 5.5px;
    }
  }
  ${/* Closing is quicker than opening */ ''}
  html:not(.menu-modal-show) #menu-modal-wrapper {
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--dp-duration) ease, visibility var(--dp-duration) ease;
  }
  ${/* Opening: visible at once (e.g. to move the focus inside) */ ''}
  html.menu-modal-show #menu-modal-wrapper {
    transition: opacity var(--dp-duration-reveal) var(--dp-ease-out);
  }
  ${/* Disable scrolling of main view */ ''}
  html.menu-modal-show {
    overflow: hidden;
    ${/* The page doesn't shift sideways when its (classic) scrollbar goes away */ ''}
    scrollbar-gutter: stable;
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
      className={`menu-modal-close scale-on-press ${className}`}
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
