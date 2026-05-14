export { useRestoreScroll }

import React, { useEffect, useRef } from 'react'

type ScrollPosition = { top: number; el: Element }

/**
 * useRestoreScroll
 *
 * Keeps the page from jumping when content changes,
 * preserving the user’s scroll position.
 *
 * @param deps Dependencies that trigger scroll restoration
 * @returns Function to set the previous top position
 */
function useRestoreScroll(deps: React.DependencyList) {
  const prevPositionRef = useRef<ScrollPosition | null>(null)

  useEffect(() => {
    if (!prevPositionRef.current) return

    const { top, el } = prevPositionRef.current
    const delta = el.getBoundingClientRect().top - top

    if (delta !== 0) window.scrollBy(0, delta)

    prevPositionRef.current = null
  }, deps)

  const setPrevPosition = (el: Element) => {
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
  }

  return setPrevPosition
}
