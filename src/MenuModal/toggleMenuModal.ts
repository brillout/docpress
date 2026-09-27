export { toggleMenuModal }
export { closeMenuModal }
export { closeMenuModalAndFocusToggle }
// Hover handling
export { ignoreHoverOnTouchStart }
export { openMenuModalOnMouseEnter }
export { keepMenuModalOpenOnMouseOver }
export { closeMenuModalOnMouseLeave }
export { closeMenuModalOnMouseLeaveToggle }

import { viewTablet } from '../Layout.js'
import { getHydrationPromise } from '../renderer/getHydrationPromise.js'
import { getViewportWidth } from '../utils/getViewportWidth.js'
import { isBrowser } from '../utils/isBrowser.js'

initScrollListener()

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
  updateAriaExpanded()
  if (isMobileNav()) openDialog()
  if (menuNavigationId !== undefined) {
    const currentModalId = getCurrentMenuId()
    if (currentModalId === menuNavigationId) return
    if (currentModalId !== null) {
      classList.remove(`menu-modal-show-${currentModalId}`)
    }
    classList.add(`menu-modal-show-${menuNavigationId}`)
    updateAriaExpanded()
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
    updateAriaExpanded()
    closeDialog()
  }
}
// Keyboard (Escape, close button): the focused element is being hidden, focus the menu's toggle instead
function closeMenuModalAndFocusToggle() {
  const toggle = document.querySelector<HTMLElement>(`.menu-toggle-${getCurrentMenuId()}`)
  const hasFocus = document.getElementById('menu-modal-wrapper')!.contains(document.activeElement)
  closeMenuModal()
  if (hasFocus) toggle?.focus()
}

// Mobile: the menu is a full-screen dialog, keyboard focus stays inside it
function openDialog() {
  const wrapper = document.getElementById('menu-modal-wrapper')!
  wrapper.setAttribute('role', 'dialog')
  wrapper.setAttribute('aria-modal', 'true')
  wrapper.setAttribute('aria-label', 'Menu')
  wrapper.addEventListener('keydown', trapFocus)
  const closeButton = wrapper.querySelector<HTMLElement>('.menu-modal-close')!
  // Apply the styles (the menu is now visible) before focusing
  getComputedStyle(closeButton).visibility
  closeButton.focus()
}
function closeDialog() {
  const wrapper = document.getElementById('menu-modal-wrapper')!
  wrapper.removeAttribute('role')
  wrapper.removeAttribute('aria-modal')
  wrapper.removeAttribute('aria-label')
  wrapper.removeEventListener('keydown', trapFocus)
}
function trapFocus(ev: KeyboardEvent) {
  if (ev.key !== 'Tab') return
  const wrapper = ev.currentTarget as HTMLElement
  const focusables = Array.from(wrapper.querySelectorAll<HTMLElement>('a[href], button')).filter((el) =>
    el.checkVisibility({ visibilityProperty: true }),
  )
  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault()
    last.focus()
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault()
    first.focus()
  }
}
function updateAriaExpanded() {
  const isOpen = document.documentElement.classList.contains('menu-modal-show')
  const currentMenuId = getCurrentMenuId()
  document.querySelectorAll('.menu-toggle').forEach((toggle) => {
    const isCurrent = toggle.classList.contains(`menu-toggle-${currentMenuId}`)
    toggle.setAttribute('aria-expanded', String(isOpen && isCurrent))
  })
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
function closeMenuModalOnMouseLeaveToggle(menuId: number) {
  if (ignoreHover()) return
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
  // Keyboard focus leaving the top nav and the menu closes the menu (it would cover the focused element)
  document.addEventListener('focusin', (ev) => {
    if (!(ev.target as Element).closest('.nav-head, #menu-modal-wrapper')) closeMenuModal()
  })
}

function toggleMenuModal(menuId: number) {
  const { classList } = document.documentElement
  if (classList.contains('menu-modal-show') && classList.contains(`menu-modal-show-${menuId}`)) {
    closeMenuModal()
  } else {
    openMenuModal(menuId)
    if (isMobileNav()) autoScroll()
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

function closeMenuModalOnMouseLeave() {
  if (ignoreHover()) return
  closeMenuModal()
}
function keepMenuModalOpenOnMouseOver() {
  if (ignoreHover()) return
  open()
}

let isTouchStart: ReturnType<typeof setTimeout> | undefined
function ignoreHoverOnTouchStart() {
  isTouchStart = setTimeout(() => {
    isTouchStart = undefined
  }, 1000)
}
function openMenuModalOnMouseEnter(menuId: number) {
  if (ignoreHover()) return
  openMenuModal(menuId)
}
function ignoreHover() {
  return isTouchStart || isMobileNav()
}
function isMobileNav() {
  return getViewportWidth() <= viewTablet
}
