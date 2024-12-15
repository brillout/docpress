export { toggleMenuModal }
export { openMenuModal }
export { keepMenuModalOpen }
export { closeMenuModal }
export { closeMenuOnMouseLeave }
export { addListenerOpenMenuModal }

import { containerQueryMobileLayout } from '../Layout'
import { getHydrationPromise } from '../renderer/getHydrationPromise'
import { getViewportWidth } from '../utils/getViewportWidth'
import { isBrowser } from '../utils/isBrowser'

initScrollListener()

function keepMenuModalOpen() {
  open()
}
function openMenuModal(menuNavigationId: number) {
  open(menuNavigationId)
}
async function open(menuNavigationId?: number) {
  if (menuModalLock) {
    if (menuNavigationId === undefined) {
      clearTimeout(menuModalLock?.timeout)
      menuModalLock = undefined
      return
    }
    menuModalLock.idNext = menuNavigationId
    return
  }
  const { classList } = document.documentElement
  if (!classList.contains('menu-modal-show')) {
    onModalOpeningOrClosing()
    classList.add('menu-modal-show')
  }
  if (menuNavigationId !== undefined) {
    const currentModalId = getCurrentMenuId()
    if (currentModalId === menuNavigationId) return
    if (currentModalId !== null) {
      classList.remove(`menu-modal-show-${currentModalId}`)
    }
    classList.add(`menu-modal-show-${menuNavigationId}`)
    await getHydrationPromise()
    const height = window.getComputedStyle(document.getElementById(`menu-navigation-${menuNavigationId}`)!).height
    document.getElementById('menu-navigation-container')!.style.height = height
  }
  listener?.()
}
let listener: () => void | undefined
function addListenerOpenMenuModal(cb: () => void) {
  listener = cb
}
function closeMenuModal() {
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-show')) {
    onModalOpeningOrClosing()
    classList.remove('menu-modal-show')
  }
}
let timeoutModalAnimation: NodeJS.Timeout | undefined
function onModalOpeningOrClosing() {
  const { classList } = document.documentElement
  classList.add('menu-modal-opening-or-closing')
  clearTimeout(timeoutModalAnimation)
  timeoutModalAnimation = setTimeout(() => {
    classList.remove('menu-modal-opening-or-closing')
  }, 450)
}

let menuModalLock:
  | {
      idCurrent: number
      idNext: number | undefined
      timeout: NodeJS.Timeout
    }
  | undefined
function closeMenuOnMouseLeave() {
  const currentModalId = getCurrentMenuId()
  if (currentModalId === null) return
  const timeout = setTimeout(() => {
    const { idCurrent, idNext } = menuModalLock!
    menuModalLock = undefined
    if (idNext === idCurrent) return
    if (idNext === undefined) {
      closeMenuModal()
    } else {
      openMenuModal(idNext)
    }
  }, 100)
  clearTimeout(menuModalLock?.timeout)
  menuModalLock = {
    idCurrent: currentModalId,
    idNext: undefined,
    timeout,
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

function toggleMenuModal(menuId: number) {
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-show') && classList.contains(`menu-modal-show-${menuId}`)) {
    closeMenuModal()
  } else {
    openMenuModal(menuId)
    if (getViewportWidth() < containerQueryMobileLayout) autoScroll()
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
