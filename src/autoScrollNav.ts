export { autoScrollNav }
export { autoScrollNav_SSR }

// - WARNING: We cannot use TypeScript here because we serialize the function.
// - Not `scrollIntoView()`: it also scrolls the main view, and it moves the starting point of the keyboard's Tab navigation
//   (the first Tab would skip the top nav).
const autoScrollNav_SSR = `autoScrollNav();${autoScrollNav.toString()}`
// `isClientNavigation`: the current link may be the one the user just clicked, it must not move under the pointer
function autoScrollNav(isClientNavigation = false) {
  const nav = document.querySelector('#nav-left .navigation-content')
  if (!nav) return
  const href = window.location.pathname
  const navLink = nav.querySelector(`a[href="${href}"]`)
  if (!navLink) return
  const container = nav.closest('#navigation-container')
  if (!container) return
  const linkRect = navLink.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  // 20px: the container's fading edges
  const edge = 20
  // (Single statements, no `{}` blocks: the server and the client transpile blocks differently, see the WARNING above)
  // First load: centered, unless already in view
  const isInView = linkRect.top >= containerRect.top + edge && linkRect.bottom <= containerRect.bottom - edge
  if (!isClientNavigation && isInView) return
  // In view (e.g. the link the user just clicked): the navigation stays still
  const isVisible = linkRect.top >= containerRect.top && linkRect.bottom <= containerRect.bottom
  if (isClientNavigation && isVisible) return
  // Partly in view: scrolled just enough
  const isPartlyVisible = linkRect.bottom > containerRect.top && linkRect.top < containerRect.bottom
  const below = linkRect.bottom - (containerRect.bottom - edge)
  const above = containerRect.top + edge - linkRect.top
  if (isClientNavigation && isPartlyVisible) return (container.scrollTop += below > 0 ? below : -above)
  // Center the link
  container.scrollTop += linkRect.top - containerRect.top - (container.clientHeight - linkRect.height) / 2
}
