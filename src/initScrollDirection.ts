export { initScrollDirection }

// `<html class="scrolled-down">` after any scroll down, until any scroll up or the page's top (Layout.tsx hides the category tabs or the whole top nav on it, by the viewport's height)
function initScrollDirection() {
  let scrollYLast = window.scrollY
  window.addEventListener(
    'scroll',
    () => {
      const { scrollY } = window
      if (scrollY === scrollYLast) return
      // Past the page's top or bottom: the elastic overscroll (Safari), not the reader scrolling back
      const { scrollHeight, clientHeight } = document.documentElement
      if (scrollY < 0 || scrollY > scrollHeight - clientHeight) return
      document.documentElement.classList.toggle('scrolled-down', scrollY > 0 && scrollY > scrollYLast)
      scrollYLast = scrollY
    },
    { passive: true },
  )
}
