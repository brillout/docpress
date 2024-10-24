export { MenuModal }
export { toggleMenuModal }
export { closeMenuModal }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { NavigationContent } from './navigation/Navigation'
import { css } from './utils/css'
import { containerQueryMobile } from './Layout'
import { Links } from './Links'
import { isBrowser } from './utils/isBrowser'

initCloseListeners()

function MenuModal() {
  return (
    <>
      <style>{getStyle()}</style>
      <div
        id="menu-modal"
        className="link-hover-animation"
        style={{
          position: 'fixed',
          width: '100%',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 9999,
          overflow: 'scroll',
          background: 'var(--bg-color)',
        }}
      >
        <div
          style={{
            // Place <LinksBottom /> to the bottom
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            justifyContent: 'space-between',
            // We don't set `container` to parent beacuse of a Chrome bug (showing a blank <MenuModal>)
            containerType: 'inline-size',
          }}
        >
          <Nav />
          <LinksBottom />
        </div>
        <CloseButton />
      </div>
    </>
  )
}
function Nav() {
  const pageContext = usePageContext()
  const navItems = pageContext.navItemsAll
  return <NavigationContent columnLayout={true} navItems={navItems} />
}
function LinksBottom() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Links style={{ height: 70 }} />
    </div>
  )
}

function getStyle() {
  return css`
html:not(.menu-modal-show) #menu-modal {
  display: none;
}
// disable scroll of main view
html.menu-modal-show {
  overflow: hidden !important;
}
@container(min-width: ${containerQueryMobile}px) {
  #menu-modal .nav-item-level-3 {
    display: none;
  }
}
`
}

function CloseButton() {
  return (
    <div
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
  if (document.documentElement.classList.contains('menu-modal-show') && getViewportWidth() < containerQueryMobile) {
    autoScroll()
  }
}
function getViewportWidth(): number {
  // `window.innerWidth` inlcudes scrollbar width: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
  return document.documentElement.clientWidth
}
function autoScroll() {
  const nav = document.querySelector('#menu-modal .navigation-content')!
  const href = window.location.pathname
  const navLinks = Array.from(nav.querySelectorAll(`a[href="${href}"]`))
  const navLink = navLinks[0]
  if (!navLink) return
  navLink.scrollIntoView({
    behavior: 'instant',
    block: 'center',
    inline: 'start',
  })
}
function closeMenuModal() {
  document.documentElement.classList.remove('menu-modal-show')
}

function initCloseListeners() {
  if (!isBrowser()) return
  document.addEventListener('click', onLinkClick)
  // It's redundant (and onLinkClick() is enough), but just to be sure.
  addEventListener('hashchange', closeMenuModal)
}
function onLinkClick(ev: MouseEvent) {
  if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return
  const linkTag = findLinkTag(ev.target as HTMLElement)
  if (!linkTag) return
  const href = linkTag.getAttribute('href')
  if (!href) return
  if (!href.startsWith('/') && !href.startsWith('#')) return
  closeMenuModal()
}
function findLinkTag(target: HTMLElement): null | HTMLElement {
  while (target.tagName !== 'A') {
    const { parentNode } = target
    if (!parentNode) {
      return null
    }
    target = parentNode as HTMLElement
  }
  return target
}
