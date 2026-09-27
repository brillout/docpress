export { autoScrollNav }
export { autoScrollNav_SSR }

// - WARNING: We cannot use TypeScript here because we serialize the function.
// - Not `scrollIntoView()`: it also scrolls the main view, and it moves the starting point of the keyboard's Tab navigation
//   (the first Tab would skip the top nav).
const autoScrollNav_SSR = `autoScrollNav();${autoScrollNav.toString()}`
function autoScrollNav() {
  const nav = document.querySelector('#nav-left .navigation-content')
  if (!nav) return
  const href = window.location.pathname
  const navLink = nav.querySelector(`a[href="${href}"]`)
  if (!navLink) return
  const container = nav.closest('#navigation-container')
  if (!container) return
  const linkRect = navLink.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  // Center the link
  container.scrollTop += linkRect.top - containerRect.top - (container.clientHeight - linkRect.height) / 2
}
