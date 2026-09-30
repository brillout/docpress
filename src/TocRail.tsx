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

// The active section is the last heading scrolled past the reading line (see measurePage()), or the section just jumped
// to. With `withProgress`, a long section on screen gets a longer rail, and the thumb is the part of the page on screen
// (see getProgressLayout()).
function useActiveSection(tocItems: { id: string }[], withProgress: boolean) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { urlPathname } = usePageContext()
  const ids = tocItems.map((item) => item.id)
  const idsKey = ids.join(' ')
  useEffect(() => {
    if (ids.length === 0) return
    let frame: number | null = null
    let jump: { id: string; scrollY: number } | null = null
    // With progress: what's painted, gliding towards the layout (see glide())
    let painted: Layout | null = null
    let paintedAt = 0
    const onJump = () => {
      let id = ''
      // A malformed hash (e.g. `#%`) is no section's
      try {
        id = decodeURIComponent(window.location.hash.slice(1))
      } catch {}
      jump = id ? { id, scrollY: window.scrollY } : null
      onScroll()
    }
    const update = () => {
      frame = null
      const rail = document.querySelector<HTMLElement>('#toc-rail .toc-rail-sticky')
      const list = rail?.querySelector<HTMLElement>('.toc-list')
      // Hidden (narrow screens): nothing to show
      if (!rail || !list || rail.getClientRects().length === 0) return
      const page = measurePage(ids)
      let activeIndex = 0
      page.sections.forEach((section, i) => {
        if (section && section.start <= page.line) activeIndex = i
      })
      // Just jumped to a section (e.g. a click on the rail): it's the active one until the reader scrolls away
      if (jump && Math.abs(window.scrollY - jump.scrollY) < 8) {
        const jumpedTo = ids.indexOf(jump.id)
        if (jumpedTo !== -1) activeIndex = jumpedTo
      } else {
        jump = null
      }
      setActiveIndex(activeIndex)
      const items = Array.from(list.querySelectorAll<HTMLElement>('.toc-item'))
      // A row: the item, and (with progress) the rail below it
      const rows = items.map((item) => item.parentElement!)
      if (withProgress) {
        // All measurements before the first write (a write followed by a read forces a layout)
        const measures = measureRail(rail, list, items, page.viewBottom - page.viewTop)
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const pageProgress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1
        const target = getProgressLayout(page, measures)
        const now = performance.now()
        const { layout, isSettled } = glide(painted ?? readLayout(rows, list), target, now - paintedAt, measures.free)
        paintedAt = now
        painted = layout
        // Attributes (not classes): React re-renders the class names
        items.forEach((item, i) => item.toggleAttribute('data-visible', !!page.sections[i]?.onScreen))
        rows.forEach((row, i) => {
          row.style.setProperty('--toc-extra', `${layout.extras[i]}px`)
        })
        paintThumb(list, layout.thumb)
        rail.style.setProperty('--page-progress', String(pageProgress))
        if (!isSettled) onScroll()
      } else {
        const listTop = list.getBoundingClientRect().top
        const rect = rows[activeIndex]?.getBoundingClientRect()
        paintThumb(list, { top: rect ? rect.top - listTop : 0, height: rect?.height ?? 0 })
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

type Page = ReturnType<typeof measurePage>
type Section = { start: number; end: number; onScreen: number }
type RailMeasures = ReturnType<typeof measureRail>
type Layout = { extras: number[]; thumb: { top: number; height: number } }

// The sections (null: not rendered, e.g. an unselected choice), the part of the page on screen, and the reading line
function measurePage(ids: string[]) {
  // Below the header and the gap a heading jumped to keeps above it (heading.css), plus a px (the jump lands on a whole
  // px, the heading up to 1px lower): the section above a heading jumped to isn't on screen
  const viewTop = getStickyOffset() + 17
  const viewBottom = window.innerHeight
  // The n-th element with the n-th occurrence of an id (a page can repeat a heading)
  const occurrences = new Map<string, number>()
  const tops = ids.map((id) => {
    const occurrence = (occurrences.get(id) ?? -1) + 1
    occurrences.set(id, occurrence)
    const heading = document.querySelectorAll(`[id="${CSS.escape(id)}"]`)[occurrence]
    return heading?.getClientRects().length ? heading.getBoundingClientRect().top : null
  })
  // A section ends where the next rendered one starts
  const sections: (Section | null)[] = []
  let end = document.querySelector('.page-content')?.getBoundingClientRect().bottom ?? 0
  for (let i = tops.length - 1; i >= 0; i--) {
    const start = tops[i]
    if (start === null || start === undefined) {
      sections[i] = null
      continue
    }
    sections[i] = { start, end, onScreen: Math.max(0, Math.min(end, viewBottom) - Math.max(start, viewTop)) }
    end = start
  }
  // A heading scrolled above the line is read. Within the last viewport of scrolling, the line moves down to the
  // viewport's bottom: the last sections, too short to ever reach the top, also get their turn.
  const lineTop = viewTop + 80
  const scrollRemaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  const line = lineTop + (window.innerHeight - lineTop) * Math.max(0, 1 - scrollRemaining / window.innerHeight)
  return { sections, viewTop, viewBottom, line }
}

// The items' heights, and the height the list may take: the rail's, less its padding, title and "Back to top". Those
// are measured on their own: derived from the list's height (rounded), the result would move with every sub-px move of
// the rows, moving their target, which moves them... (the rows would jitter forever).
function measureRail(rail: HTMLElement, list: HTMLElement, items: HTMLElement[], viewHeight: number) {
  const style = getComputedStyle(rail)
  const railRect = rail.getBoundingClientRect()
  const listRect = list.getBoundingClientRect()
  const above = listRect.top - railRect.top + rail.scrollTop - parseFloat(style.borderTopWidth)
  const below =
    rail.lastElementChild!.getBoundingClientRect().bottom - listRect.bottom + parseFloat(style.paddingBottom)
  const available = Math.min(parseFloat(style.maxHeight) || Infinity, viewHeight) - above - below
  const heights = items.map((item) => item.getBoundingClientRect().height)
  // Less some slack: filled to the last (fractional) px, the rail would overflow by rounding, and a classic scrollbar
  // would pop up, narrowing the items (which re-wrap, changing the height...)
  const free = Math.max(0, Math.floor(available - heights.reduce((a, b) => a + b, 0)) - 8)
  return { heights, available, free }
}

// The rows' extra lengths and the thumb (px). The thumb is the part of the page on screen, on the rows (each section
// spans its row): in a long section, open, that's the screen at the section's scale, sliding down its rail.
function getProgressLayout(page: Page, measures: RailMeasures): Layout {
  const { heights } = measures
  const extras = getRowExtras(page, measures)
  let thumbTop: number | null = null
  let thumbBottom = 0
  let rowTop = 0
  page.sections.forEach((section, i) => {
    const rowHeight = heights[i]! + extras[i]!
    if (section?.onScreen) {
      const length = Math.max(1, section.end - section.start)
      thumbTop ??= rowTop + ((Math.max(section.start, page.viewTop) - section.start) / length) * rowHeight
      thumbBottom = rowTop + ((Math.min(section.end, page.viewBottom) - section.start) / length) * rowHeight
    }
    rowTop += rowHeight
  })
  // Not in the introduction (nothing on screen is on the rail): collapsed at the list's top
  if (thumbTop === null) return { extras, thumb: { top: 0, height: 0 } }
  const height = thumbBottom - thumbTop
  // Never a sliver (e.g. a list too long to leave room for a longer rail)
  if (height >= thumbMin) return { extras, thumb: { top: thumbTop, height } }
  const top = Math.min(Math.max(0, thumbTop + (height - thumbMin) / 2), rowTop - thumbMin)
  return { extras, thumb: { top, height: thumbMin } }
}

// The extra length (px) of each row, below its item. A long section gets a rail as long as the section (scaled: a page
// of `railContentLength` px of content would fill the rail) while it's on screen, opening over the first
// `openingShare` of a screen of it scrolled into view (and closing likewise). Only if the thumb (the screen, at the
// section's scale) travels down the rail: not for a section that fits on the screen (all of it is in view at once,
// there's no progress to show within it), nor for a few px (the list would twitch for nothing). Within the rail's free
// height: if two sections are open at once and don't both fit, they share it.
function getRowExtras(page: Page, { heights, available, free }: RailMeasures) {
  const viewHeight = Math.max(1, page.viewBottom - page.viewTop)
  const extras = heights.map((height, i) => {
    const section = page.sections[i]
    if (!section?.onScreen) return 0
    const length = section.end - section.start
    if (length <= viewHeight) return 0
    const extra = Math.min((length / railContentLength) * available - height, free)
    const travel = (height + extra) * (1 - viewHeight / length)
    if (extra < rowChangeMin || travel < rowChangeMin) return 0
    return extra * smoothstep(Math.min(1, section.onScreen / (viewHeight * openingShare)))
  })
  const total = extras.reduce((a, b) => a + b, 0)
  // Whole px: a sub-px change of the layout doesn't move the target (the rows would never settle)
  return extras.map((extra) => Math.floor(total > free ? (extra * free) / total : extra))
}
const railContentLength = 11000
const openingShare = 0.25
const rowChangeMin = 24
const thumbMin = 16
function smoothstep(x: number) {
  return x * x * (3 - 2 * x)
}

// Every frame, the rows and the thumb go the same share of the way to the layout (an exponential ease-out): they
// respond at once, flow over the wheel's steps, move together (the thumb stays on its rows), and change course without
// a jolt.
function glide(from: Layout, to: Layout, frameTime: number, free: number): { layout: Layout; isSettled: boolean } {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // After a pause: a frame's worth
  const k = isReducedMotion ? 1 : 1 - Math.exp(-(frameTime > 50 ? 1000 / 60 : frameTime) / glideTime)
  const lerp = (a: number, b: number) => a + (b - a) * k
  const layout = {
    extras: to.extras.map((extra, i) => lerp(from.extras[i] ?? 0, extra)),
    thumb: { top: lerp(from.thumb.top, to.thumb.top), height: lerp(from.thumb.height, to.thumb.height) },
  }
  const isNear = (a: number, b: number) => Math.abs(a - b) < 0.1
  const isSettled =
    isNear(layout.thumb.top, to.thumb.top) &&
    isNear(layout.thumb.height, to.thumb.height) &&
    layout.extras.every((extra, i) => isNear(extra, to.extras[i]!))
  // Settled, or taller than the rail allows (e.g. while the window shrinks: the rail would overflow): at once
  if (isSettled || layout.extras.reduce((a, b) => a + b, 0) > free) return { layout: to, isSettled: true }
  return { layout, isSettled: false }
}
// The glide's time constant (ms): 90% of the way in about 2.3x as long
const glideTime = 60

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

function paintThumb(list: HTMLElement, thumb: Layout['thumb']) {
  list.style.setProperty('--thumb-top', `${thumb.top}px`)
  list.style.setProperty('--thumb-height', `${thumb.height}px`)
}

// The height of the sticky header (the top bar, and the category tabs if any), 0 if it isn't sticky
function getStickyOffset() {
  const header = document.querySelector('.doc-page > header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  return header.getBoundingClientRect().height
}
