export { initTooltipGroup }

// Tooltips (tooltip.css) along the top nav: once one is shown, the neighbors' show at once (no delay, no fade), until
// the pointer has left the labelled controls for a moment. Like macOS's toolbars and Radix's `skipDelayDuration`.
const showDelay = 350
const resetDelay = 300

let isInstalled = false
function initTooltipGroup() {
  if (isInstalled) return
  isInstalled = true
  let showTimer: ReturnType<typeof setTimeout> | undefined
  let resetTimer: ReturnType<typeof setTimeout> | undefined
  document.addEventListener(
    'pointerover',
    (ev) => {
      const row = document.querySelector('.nav-head')
      if (!row) return
      const labelled = (ev.target as Element).closest?.('[aria-label]')
      // The elements that show a tooltip: the same selector as tooltip.css
      const isOnLabelled =
        !!labelled && row.contains(labelled) && !labelled.matches('nav, aside, section, .search-link')
      if (isOnLabelled) {
        clearTimeout(resetTimer)
        if (!row.hasAttribute('data-tooltip-instant')) {
          clearTimeout(showTimer)
          showTimer = setTimeout(() => row.setAttribute('data-tooltip-instant', ''), showDelay)
        }
      } else {
        clearTimeout(showTimer)
        clearTimeout(resetTimer)
        resetTimer = setTimeout(() => row.removeAttribute('data-tooltip-instant'), resetDelay)
      }
    },
    { passive: true },
  )
  // The pointer left the window
  document.addEventListener(
    'pointerout',
    (ev) => {
      if (ev.relatedTarget) return
      clearTimeout(showTimer)
      document.querySelector('.nav-head')?.removeAttribute('data-tooltip-instant')
    },
    { passive: true },
  )
}
