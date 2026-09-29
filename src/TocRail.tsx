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
// A thumb on the rail's track marks where the reader is: the active section, or (`tocProgress`) where in it.
function TocRail() {
  const pageContext = usePageContext()
  const { tocItems } = pageContext.resolved
  const { tocProgress } = pageContext.globalContext.config.docpress
  const activeIndex = useActiveSection(tocItems, !!tocProgress)
  // Empty, the column is still reserved: the page content doesn't shift between pages with and without sections
  if (tocItems.length === 0) return <div id="toc-rail" />
  return (
    <div id="toc-rail">
      <nav
        className={cls(['toc-rail-sticky', 'scroll-fade', tocProgress && 'toc-progress'])}
        aria-labelledby="toc-rail-title"
      >
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
// With `withProgress`, the section being read gets a longer rail, and the thumb slides down it (see update()).
function useActiveSection(tocItems: { id: string }[], withProgress: boolean) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { urlPathname } = usePageContext()
  const ids = tocItems.map((item) => item.id)
  const idsKey = ids.join(' ')
  useEffect(() => {
    if (ids.length === 0) return
    let frame: number | null = null
    let jump: { id: string; scrollY: number } | null = null
    // With progress: what's painted (the rows' extra lengths, the thumb), and the transition to a new layout
    let painted: Layout | null = null
    let transition: { from: Layout; start: number; key: string } | null = null
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
      // A row: the item, and (with progress) the rail below it
      const rows = items.map((item) => item.parentElement!)
      if (withProgress) {
        const viewTop = stickyOffset
        const viewBottom = window.innerHeight
        const viewHeight = Math.max(1, viewBottom - viewTop)
        const sections = tops.map((start, i) => {
          if (start === null) return null
          const end = tops.slice(i + 1).find((top) => top !== null) ?? contentBottom
          return { start, end }
        })
        sections.forEach((section, i) => {
          const isVisible = !!section && Math.min(section.end, viewBottom) > Math.max(section.start, viewTop)
          // Attributes (not classes): React re-renders the class names
          items[i]?.toggleAttribute('data-visible', isVisible)
        })
        // The section being read gets a longer rail (not while reading the introduction)
        const heights = items.map((item) => item.getBoundingClientRect().height)
        const maxHeight = Math.min(
          parseFloat(getComputedStyle(rail).maxHeight) || Infinity,
          window.innerHeight - stickyOffset,
        )
        const available = maxHeight - (rail.scrollHeight - list.getBoundingClientRect().height)
        const expanded = jump || (tops[activeIndex] ?? Infinity) <= line ? activeIndex : null
        const lengths = sections.map((section) => (section ? section.end - section.start : 0))
        const targetExtras = getRowExtras(heights, lengths, available, expanded)
        // A new layout (the reader moved on to another section): the rows and the thumb move to it together, on one
        // timeline, from wherever they are
        // (Not by sub-px changes, e.g. of the measured free height)
        const key = `${expanded} ${targetExtras.map((extra) => Math.round(extra / 4)).join()}`
        if (transition?.key !== key) {
          const from = painted ?? readLayout(rows, list)
          transition = { from, start: performance.now(), key }
        }
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const t = isReducedMotion ? 1 : Math.min(1, (performance.now() - transition.start) / layoutDuration)
        const k = easeInOutCubic(t)
        const { from } = transition
        // Never more than the free height (e.g. while the window shrinks): the rail would overflow and show a scrollbar
        const free = getFreeHeight(heights, available)
        const blended = targetExtras.map((extra, i) => lerp(from.extras[i] ?? 0, extra, k))
        const blendedTotal = blended.reduce((a, b) => a + b, 0)
        const extras = blended.map((extra) => (blendedTotal > free ? (extra * free) / blendedTotal : extra))
        rows.forEach((row, i) => {
          row.style.setProperty('--toc-extra', `${extras[i]}px`)
        })
        // The thumb, on the new layout. In a long section: the screen, at the section's scale on its rail, sliding down
        // the rail as the section is read (it reaches the bottom as the next section takes over). In a short one: the
        // item. Moving to it in a straight line, like the rows: no detour.
        const rowTops: number[] = []
        heights.reduce((y, height, i) => {
          rowTops.push(y)
          return y + height + targetExtras[i]!
        }, 0)
        let thumb = { top: 0, height: 0 }
        const section = expanded === null ? null : sections[expanded]
        if (expanded !== null && section) {
          const rowHeight = heights[expanded]! + targetExtras[expanded]!
          thumb = { top: rowTops[expanded]!, height: rowHeight }
          if (targetExtras[expanded]! > 0) {
            const length = Math.max(1, section.end - section.start)
            const height = Math.min(rowHeight, (viewHeight * rowHeight) / length)
            const read = Math.min(1, Math.max(0, (line - section.start) / length))
            thumb = { top: rowTops[expanded]! + read * (rowHeight - height), height }
          }
        }
        thumb = { top: lerp(from.thumb.top, thumb.top, k), height: lerp(from.thumb.height, thumb.height, k) }
        list.style.setProperty('--thumb-top', `${thumb.top}px`)
        list.style.setProperty('--thumb-height', `${thumb.height}px`)
        painted = { extras, thumb }
        if (t < 1) onScroll()
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const pageProgress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1
        rail.style.setProperty('--page-progress', String(pageProgress))
      } else {
        const listTop = list.getBoundingClientRect().top
        const rect = rows[activeIndex]?.getBoundingClientRect()
        list.style.setProperty('--thumb-top', `${rect ? rect.top - listTop : 0}px`)
        list.style.setProperty('--thumb-height', `${rect?.height ?? 0}px`)
      }
      rail.toggleAttribute('data-scrolled', window.scrollY > 200)
    }
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    onJump()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('hashchange', onJump)
    // Sections change length (images load, a choice is switched)
    const resizeObserver = new ResizeObserver(onScroll)
    const pageContent = document.querySelector('.page-content')
    if (pageContent) resizeObserver.observe(pageContent)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('hashchange', onJump)
      if (frame !== null) cancelAnimationFrame(frame)
    }
    // Also re-measure upon navigation: two pages can have the same headings
  }, [idsKey, urlPathname, withProgress])
  return activeIndex
}

type Layout = { extras: number[]; thumb: { top: number; height: number } }
// What's painted, e.g. by the previous page (upon client-side navigation, the rows are reused)
function readLayout(rows: HTMLElement[], list: HTMLElement): Layout {
  return {
    extras: rows.map((row) => parseFloat(row.style.getPropertyValue('--toc-extra')) || 0),
    thumb: {
      top: parseFloat(list.style.getPropertyValue('--thumb-top')) || 0,
      height: parseFloat(list.style.getPropertyValue('--thumb-height')) || 0,
    },
  }
}

// The extra length (px) of each row, below its item: the section being read gets a rail as long as the section
// (scaled: a page of `railContentLength` px of content would fill the rail), in the rail's free height. Not by a few
// px: the list would twitch for nothing.
function getRowExtras(heights: number[], lengths: number[], available: number, expanded: number | null) {
  const free = getFreeHeight(heights, available)
  return heights.map((height, i) => {
    if (i !== expanded) return 0
    const extra = Math.min((lengths[i]! / railContentLength) * available - height, free)
    return extra < 24 ? 0 : extra
  })
}
const railContentLength = 11000
// The rail's height the items leave free, less some slack: filled to the last (fractional) px, the rail would overflow
// by rounding, and a classic scrollbar would pop up, narrowing the items (which re-wrap, changing the height...)
function getFreeHeight(heights: number[], available: number) {
  return Math.max(0, Math.floor(available - heights.reduce((a, b) => a + b, 0)) - 8)
}
// Moving to a new layout: things on screen moving from one place to another ease in and out
const layoutDuration = 300
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k
}

// The height of the sticky header (the top bar, and the category tabs if any), 0 if it isn't sticky
function getStickyOffset() {
  const header = document.querySelector('.doc-page > header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  return header.getBoundingClientRect().height
}
