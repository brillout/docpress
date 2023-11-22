import { assert } from './utils/client'

autoScrollNav()

function autoScrollNav() {
  const navigationEl = document.getElementById('navigation-content-main')
  assert(navigationEl)
  const href = window.location.pathname
  const navLinks: HTMLElement[] = Array.from(navigationEl.querySelectorAll(`a[href="${href}"]`))
  assert(navLinks.length <= 1, { navLinks, href })
  const navLink = navLinks[0]
  if (!navLink) return

  /* Doesn't work: the scrolling is off by hundreds of px (I guess because this function runs too early while the page is still rendering)
  const navigationContainerEl = document.getElementById("navigation-container")
  const offset = navLink.offsetTop - (window.innerHeight / 2)
  navigationContainerEl.scrollTop = offset
  */

  /* Doesn't work: scrollIntoView() still scrolls the main view
  const overflowOriginal = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  ...
  document.documentElement.style.overflow = overflowOriginal
  */

  const scrollTopOriginal = document.documentElement.scrollTop
  navLink.scrollIntoView({
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/46654
    behavior: 'instant',
    block: 'center',
    inline: 'start'
  })
  // Avoid scrollIntoView() from scrolling the main view. Alternatively, we could use scrollIntoViewIfNeeded() (https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded) which doesn't scroll the main view but Firefox doesn't support it.
  document.documentElement.scrollTop = scrollTopOriginal
}
