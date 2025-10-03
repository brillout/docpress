export { autoScrollNav }
export { autoScrollNav_SSR }

// - WARNING: We cannot use TypeScript here because we serialize the function.
// - We have to save & restore `document.documentElement.scrollTop` because scrollIntoView() scrolls the main view. (I don't know why).
//   - Failed alternatives:
//     - scrollIntoViewIfNeeded() (https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded) would work (it doesn't scroll the main view) but Firefox doesn't support it.
//     - Doesn't work: the scrolling is off by hundreds of px (I guess because this function runs too early while the page is still rendering).
//       ```js
//       const offset = navLink.offsetTop - (window.innerHeight / 2)
//       navigationContainerEl.scrollTop = offset
//       ```
//     - Doesn't work: scrollIntoView() still scrolls the main view
//       ```js
//       const overflowOriginal = document.documentElement.style.overflow
//       document.documentElement.style.overflow = 'hidden'
//       // ...
//       document.documentElement.style.overflow = overflowOriginal
//       ```
const autoScrollNav_SSR = `autoScrollNav();${autoScrollNav.toString()}`
function autoScrollNav() {
  const nav = document.querySelector('#nav-left .navigation-content')
  if (!nav) return
  const href = window.location.pathname
  const navLinks = Array.from(nav.querySelectorAll(`a[href="${href}"]`))
  const navLink = navLinks[0]
  if (!navLink) return

  const scrollTopOriginal = document.documentElement.scrollTop
  navLink.scrollIntoView({
    behavior: 'instant',
    block: 'center',
    inline: 'start',
  })
  document.documentElement.scrollTop = scrollTopOriginal
}
