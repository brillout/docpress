export { MenuModal }
export { toggleMenuModal }
export { openMenuModal }
export { closeMenuModal }
export { closeMenuModalWithDelay }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { css } from './utils/css'
import { containerQueryMobileLayout, containerQueryMobileMenu } from './Layout'
import { NavSecondaryContent } from './NavSecondaryContent'
import { getViewportWidth } from './utils/getViewportWidth'
import { Style } from './utils/Style'
import { NavigationWithColumnLayout } from './MenuModal/NavigationWithColumnLayout'
import { isBrowser } from './utils/isBrowser'

initScrollListener()

function MenuModal({ isTopNav }: { isTopNav: boolean }) {
  return (
    <>
      <Style>{getStyle()}</Style>
      <div
        id="menu-modal"
        className="link-hover-animation add-transition"
        style={{
          position: isTopNav ? 'absolute' : 'fixed',
          width: '100%',
          top: 'var(--nav-head-height)',
          left: 0,
          zIndex: 9999,
          overflowY: 'scroll',
          background: '#ededef',
          transitionProperty: 'opacity',
          // https://github.com/brillout/docpress/issues/23
          // https://stackoverflow.com/questions/64514118/css-overscroll-behavior-contain-when-target-element-doesnt-overflow
          // https://stackoverflow.com/questions/9538868/prevent-body-from-scrolling-when-a-modal-is-opened
          overscrollBehavior: 'none',
          /*
          borderBottomRightRadius: 15,
          borderBottomLeftRadius: 15,
          */
        }}
        onMouseOver={openMenuModal}
        onMouseLeave={closeMenuModal}
      >
        <div
          style={{
            // Place <NavSecondary /> to the bottom
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '100%',
            // We don't set `container` to parent beacuse of a Chrome bug (showing a blank <MenuModal>)
            container: 'container-viewport / inline-size',
          }}
        >
          <Nav />
          <NavSecondary className="show-only-for-mobile" />
        </div>
        <CloseButton className="show-only-for-mobile" />
      </div>
    </>
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
        marginTop: 20,
      }}
    >
      <NavSecondaryContent style={{ height: 70 }} />
    </div>
  )
}

function getStyle() {
  // Firefox doesn't support `dvh` yet: https://caniuse.com/?search=dvh
  // - We use dvh because of mobile: https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser/72245072#72245072
  // - Let's always use `dvh` instead of `vh` once Firefox supports it.
  return css`
#menu-modal {
  max-height:  calc(100vh - var(--nav-head-height));
  max-height: calc(100dvh - var(--nav-head-height));
}
@media(max-width: ${containerQueryMobileMenu}px) {
  #menu-modal {
    height:  calc(100vh);
    height: calc(100dvh);
  }
  html.menu-modal-show {
    overflow: hidden !important;
  }
}
html:not(.menu-modal-show) #menu-modal {
  opacity: 0;
  pointer-events: none;
}
@container container-viewport (min-width: ${containerQueryMobileLayout}px) {
  #menu-modal .nav-item-level-3 {
    display: none;
  }
}
@media(max-width: ${containerQueryMobileMenu}px) {
  #menu-modal {
    --nav-head-height: 0px !important;
  }
}
@media(min-width: ${containerQueryMobileMenu + 1}px) {
  .show-only-for-mobile {
    display: none !important;
  }
}
`
}

function CloseButton({ className }: { className: string }) {
  return (
    <div
      className={className}
      onClick={toggleMenuModal}
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

function toggleMenuModal() {
  document.documentElement.classList.toggle('menu-modal-show')
  if (
    document.documentElement.classList.contains('menu-modal-show') &&
    getViewportWidth() < containerQueryMobileLayout
  ) {
    autoScroll()
  }
}
function autoScroll() {
  const nav = document.querySelector('#menu-modal .navigation-content')!
  const href = window.location.pathname
  const navLinks = Array.from(nav.querySelectorAll(`a[href="${href}"]`))
  const navLink = navLinks[0] as HTMLElement | undefined
  if (!navLink) return
  // None of the following seemes to be working: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  if (findCollapsibleEl(navLink)!.classList.contains('collapsible-collapsed')) return
  navLink.scrollIntoView({
    behavior: 'instant',
    block: 'center',
    inline: 'start',
  })
}
function findCollapsibleEl(navLink: HTMLElement | undefined) {
  let parentEl: HTMLElement | null | undefined = navLink
  while (parentEl) {
    if (parentEl.classList.contains('collapsible')) return parentEl
    parentEl = parentEl.parentElement
  }
  return null
}
let closeMenuModalPending: NodeJS.Timeout
function openMenuModal() {
  clearTimeout(closeMenuModalPending)
  document.documentElement.classList.add('menu-modal-show')
}
function closeMenuModal() {
  document.documentElement.classList.remove('menu-modal-show')
}
function closeMenuModalWithDelay(delay: number) {
  closeMenuModalPending = setTimeout(closeMenuModal, delay)
}

function initScrollListener() {
  if (!isBrowser()) return
  window.addEventListener('scroll', closeMenuModal, { passive: true })
}
