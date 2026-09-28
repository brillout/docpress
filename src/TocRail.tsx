export { TocRail }
export { tocRailWidth }
export { viewTocRail }

import React, { useEffect, useState } from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { cls } from './utils/cls.js'
import './TocRail.css'

const tocRailWidth = 220
// Three columns: left navigation + page content + "On this page"
const viewTocRail = 1280

// The right-hand "On this page" rail. Server-rendered from the page's `##`/`###` headings; the active item (and the
// reading progress) is set after hydration: no active item in the HTML => no hydration mismatch.
// A thumb on the rail's track marks where the reader is: the active section, or (`tocProgress`) the part of the page
// that's on screen, mapped onto the list.
function TocRail() {
  const pageContext = usePageContext()
  const { tocItems } = pageContext.resolved
  const { tocProgress } = pageContext.globalContext.config.docpress
  const activeIndex = useActiveSection(tocItems, !!tocProgress)
  // Empty, the column is still reserved: the page content doesn't shift between pages with and without sections
  if (tocItems.length === 0) return <div id="toc-rail" />
  return (
    <div id="toc-rail">
      <nav className={cls(['toc-rail-sticky', tocProgress && 'toc-progress'])} aria-labelledby="toc-rail-title">
        <div id="toc-rail-title" className="toc-rail-title">
          On this page
        </div>
        <div className="toc-list">
          <ul>
            {tocItems.map((item, i) => (
              // A page can repeat a heading (same id)
              <li key={i}>
                <a
                  href={`#${item.id}`}
                  className={cls(['toc-item', `toc-item-level-${item.level}`, i === activeIndex && 'toc-item-active'])}
                  aria-current={i === activeIndex ? 'location' : undefined}
                >
                  {parseMarkdownMini(item.title)}
                </a>
              </li>
            ))}
          </ul>
          <div className="toc-thumb" aria-hidden="true" />
        </div>
        <BackToTop withProgress={!!tocProgress} />
      </nav>
    </div>
  )
}

// With `tocProgress`, a ring shows how much of the page has been read (`--page-progress`, set by useActiveSection())
function BackToTop({ withProgress }: { withProgress: boolean }) {
  return (
    <button
      type="button"
      className="toc-back-to-top"
      onClick={() => {
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' })
      }}
    >
      {withProgress ? (
        <svg className="toc-progress-ring" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" pathLength={1} className="toc-progress-ring-track" />
          <circle cx="8" cy="8" r="6.25" pathLength={1} className="toc-progress-ring-fill" />
        </svg>
      ) : (
        <svg className="toc-back-to-top-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 12.5v-9M4 7.5l4-4 4 4" />
        </svg>
      )}
      Back to top
    </button>
  )
}

// The active section is the last heading scrolled past the activation line (see below), or the section just jumped to.
// With `withProgress`, each item also gets `--toc-progress` (0 to 1): how much of its section has been read.
function useActiveSection(tocItems: { id: string }[], withProgress: boolean) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { urlPathname } = usePageContext()
  const ids = tocItems.map((item) => item.id)
  const idsKey = ids.join(' ')
  useEffect(() => {
    if (ids.length === 0) return
    let frame: number | null = null
    let jump: { id: string; scrollY: number } | null = null
    const onJump = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      jump = id ? { id, scrollY: window.scrollY } : null
      onScroll()
    }
    const update = () => {
      frame = null
      // The n-th element with the n-th occurrence of an id (a page can repeat a heading)
      const occurrences: Record<string, number> = {}
      const headings = ids.map((id) => {
        occurrences[id] = (occurrences[id] ?? -1) + 1
        return document.querySelectorAll(`[id="${CSS.escape(id)}"]`)[occurrences[id]]
      })
      // Measure once, then compute and paint. No position: the heading isn't rendered (e.g. an unselected choice).
      const tops = headings.map((heading) =>
        heading?.getClientRects().length ? heading.getBoundingClientRect().top : null,
      )
      const contentBottom = document.querySelector('.page-content')?.getBoundingClientRect().bottom ?? 0
      const stickyOffset = getStickyOffset()
      // A heading scrolled above the line is read. Within the last viewport of scrolling, the line moves down to the
      // viewport's bottom: the last sections, too short to ever reach the top, also get their turn.
      const lineTop = stickyOffset + 80
      const scrollRemaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      const line = lineTop + (window.innerHeight - lineTop) * Math.max(0, 1 - scrollRemaining / window.innerHeight)
      let activeIndex = 0
      tops.forEach((top, i) => {
        if (top !== null && top <= line) activeIndex = i
      })
      // Just jumped to a section (e.g. a click on the rail): it's the active one until the reader scrolls away
      if (jump && Math.abs(window.scrollY - jump.scrollY) < 8) {
        const jumpedTo = ids.indexOf(jump.id)
        if (jumpedTo !== -1) activeIndex = jumpedTo
      } else {
        jump = null
      }
      setActiveIndex(activeIndex)
      // The thumb (and, with progress, which items are on screen), painted directly: it follows every scroll frame
      const rail = document.querySelector<HTMLElement>('#toc-rail .toc-rail-sticky')
      const list = rail?.querySelector<HTMLElement>('.toc-list')
      if (!rail || !list) return
      const items = Array.from(list.querySelectorAll<HTMLElement>('.toc-item'))
      const listTop = list.getBoundingClientRect().top
      const itemBoxes = items.map((item) => {
        const rect = item.getBoundingClientRect()
        return { top: rect.top - listTop, height: rect.height }
      })
      let thumb: { top: number; bottom: number } | null = null
      if (withProgress) {
        // The on-screen part of each section, mapped onto its item
        const viewTop = stickyOffset
        const viewBottom = window.innerHeight
        tops.forEach((start, i) => {
          const box = itemBoxes[i]
          const isVisible = (() => {
            if (start === null || !box) return false
            const end = tops.slice(i + 1).find((top) => top !== null) ?? contentBottom
            const from = Math.max(start, viewTop)
            const to = Math.min(end, viewBottom)
            if (to <= from) return false
            const length = Math.max(1, end - start)
            const top = box.top + ((from - start) / length) * box.height
            const bottom = box.top + ((to - start) / length) * box.height
            thumb = { top: thumb?.top ?? top, bottom }
            return true
          })()
          // Attributes (not classes): React re-renders the class names
          items[i]?.toggleAttribute('data-visible', isVisible)
        })
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const pageProgress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1
        rail.style.setProperty('--page-progress', String(pageProgress))
      } else {
        const box = itemBoxes[activeIndex]
        if (box) thumb = { top: box.top, bottom: box.top + box.height }
      }
      const { top, bottom } = thumb ?? { top: 0, bottom: 0 }
      list.style.setProperty('--thumb-top', `${top}px`)
      list.style.setProperty('--thumb-height', `${bottom - top}px`)
      rail.toggleAttribute('data-scrolled', window.scrollY > 200)
    }
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    onJump()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('hashchange', onJump)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('hashchange', onJump)
      if (frame !== null) cancelAnimationFrame(frame)
    }
    // Also re-measure upon navigation: two pages can have the same headings
  }, [idsKey, urlPathname, withProgress])
  return activeIndex
}

function getStickyOffset() {
  const value = getComputedStyle(document.querySelector('.doc-page') ?? document.body).getPropertyValue(
    '--nav-head-sticky-offset',
  )
  return parseFloat(value) || 0
}
