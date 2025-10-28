export { toggleMenuModalOnClick }
export { openMenuModalOnMouseEnter }
export { keepMenuModalOpenOnMouseOver }
export { closeMenuModal }
export { coseMenuModalOnMouseLeave }
export { ignoreHoverOnTouchStart }

import { viewTablet } from '../Layout'
import { getHydrationPromise } from '../renderer/getHydrationPromise'
import { getViewportWidth } from '../utils/getViewportWidth'
import { isBrowser } from '../utils/isBrowser'

initScrollListener()

function keepMenuModalOpenOnMouseOver() {
  open()
}
function openMenuModalOnMouseEnter(menuId: number) {
  if (ignoreHover) return
  if (isMobileNav()) return
  openMenuModal(menuId)
}
function openMenuModal(menuNavigationId: number) {
  open(menuNavigationId)
}
async function open(menuNavigationId?: number) {
  if (toggleLock) {
    if (menuNavigationId === undefined) {
      clearTimeout(toggleLock?.timeoutAction)
      toggleLock = undefined
    } else {
      // Register open() operation to be applied later, after the lock has resolved.
      toggleLock.idToOpen = menuNavigationId
    }
    return
  }
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-display-only-one')) {
    classList.remove('menu-modal-display-only-one')
  } else if (!classList.contains('menu-modal-show')) {
    enableDisplayOnlyOne()
  }
  classList.add('menu-modal-show')
  if (menuNavigationId !== undefined) {
    const currentModalId = getCurrentMenuId()
    if (currentModalId === menuNavigationId) return
    if (currentModalId !== null) {
      classList.remove(`menu-modal-show-${currentModalId}`)
    }
    classList.add(`menu-modal-show-${menuNavigationId}`)
    await getHydrationPromise()
    // Because all `.menu-navigation-content` are `position: absolute` we have to propagate the content height ourselves.
    const height = window.getComputedStyle(document.getElementById(`menu-navigation-${menuNavigationId}`)!).height
    document.getElementById('menu-navigation-container')!.style.height = height
  }
}
function closeMenuModal() {
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-show')) {
    enableDisplayOnlyOne()
    classList.remove('menu-modal-show')
  }
}
let timeoutModalAnimation: NodeJS.Timeout | undefined
function enableDisplayOnlyOne() {
  const { classList } = document.documentElement
  classList.add('menu-modal-display-only-one')
  clearTimeout(timeoutModalAnimation)
  timeoutModalAnimation = setTimeout(() => {
    classList.remove('menu-modal-display-only-one')
  }, 430)
}

let toggleLock:
  | {
      idCurrent: number
      idToOpen: number | undefined
      timeoutAction: NodeJS.Timeout
    }
  | undefined
function coseMenuModalOnMouseLeave(menuId: number) {
  if (ignoreHover) return
  if (isMobileNav()) return
  clearTimeout(toggleLock?.timeoutAction)
  const timeoutAction = setTimeout(action, 100)
  toggleLock = {
    idCurrent: menuId,
    idToOpen: undefined,
    timeoutAction,
  }
  return
  function action() {
    const { idCurrent, idToOpen: idNext } = toggleLock!
    toggleLock = undefined
    if (idNext === idCurrent) return
    if (idNext === undefined) {
      closeMenuModal()
    } else {
      openMenuModal(idNext)
    }
  }
}
function getCurrentMenuId(): null | number {
  const { classList } = document.documentElement
  const prefix = 'menu-modal-show-'
  const cls = Array.from(classList).find((cls) => cls.startsWith(prefix))
  if (!cls) return null
  return parseInt(cls.slice(prefix.length), 10)
}

function initScrollListener() {
  if (!isBrowser()) return
  window.addEventListener('scroll', closeMenuModal, { passive: true })
}

function toggleMenuModalOnClick(menuId: number) {
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-show') && classList.contains(`menu-modal-show-${menuId}`)) {
    closeMenuModal()
  } else {
    openMenuModal(menuId)
    if (getViewportWidth() < viewTablet) autoScroll()
  }
}

function autoScroll() {
  const nav = document.querySelector('#menu-modal-wrapper .navigation-content')!
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

let ignoreHover: ReturnType<typeof setTimeout> | undefined
function ignoreHoverOnTouchStart() {
  ignoreHover = setTimeout(() => {
    ignoreHover = undefined
  }, 1000)
}

function isMobileNav() {
  return window.innerWidth <= viewTablet
}
