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
    // With progress: what's painted (the rows' extra lengths, the thumb), gliding towards the layout (see below)
    let painted: Layout | null = null
    let paintedAt = 0
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
        // A long section gets a longer rail while it's on screen: it opens as the section scrolls into view and closes
        // as it scrolls out, following the scroll
        const heights = items.map((item) => item.getBoundingClientRect().height)
        const maxHeight = Math.min(
          parseFloat(getComputedStyle(rail).maxHeight) || Infinity,
          window.innerHeight - stickyOffset,
        )
        const available = maxHeight - getRailChromeHeight(rail, list)
        const lengths = sections.map((section) => (section ? section.end - section.start : 0))
        const onScreen = sections.map((section) =>
          section ? Math.max(0, Math.min(section.end, viewBottom) - Math.max(section.start, viewTop)) : 0,
        )
        const targetExtras = getRowExtras(heights, lengths, onScreen, available, viewHeight)
        // The thumb: the part of the page on screen, on the rows (each section spans its row). In a long section, open,
        // that's the screen at the section's scale, sliding down its rail.
        const rowTops: number[] = []
        heights.reduce((y, height, i) => {
          rowTops.push(y)
          return y + height + targetExtras[i]!
        }, 0)
        let targetThumb: { top: number; height: number } | null = null
        sections.forEach((section, i) => {
          if (!section || onScreen[i] === 0) return
          const length = Math.max(1, section.end - section.start)
          const rowHeight = heights[i]! + targetExtras[i]!
          const top = rowTops[i]! + ((Math.max(section.start, viewTop) - section.start) / length) * rowHeight
          const bottom = rowTops[i]! + ((Math.min(section.end, viewBottom) - section.start) / length) * rowHeight
          const thumbTop: number = targetThumb?.top ?? top
          targetThumb = { top: thumbTop, height: bottom - thumbTop }
        })
        // Not in the introduction (nothing on screen is on the rail): collapsed at the list's top
        targetThumb ??= { top: 0, height: 0 }
        // Never a sliver (e.g. a list too long to leave room for a longer rail)
        if (targetThumb.height > 0 && targetThumb.height < thumbMin) {
          const listHeight =
            rowTops[rowTops.length - 1]! + heights[heights.length - 1]! + targetExtras[targetExtras.length - 1]!
          const top = Math.min(
            Math.max(0, targetThumb.top + (targetThumb.height - thumbMin) / 2),
            listHeight - thumbMin,
          )
          targetThumb = { top, height: thumbMin }
        }
        // Gliding: every frame, the rows and the thumb go the same share of the way to where they belong (an
        // exponential ease-out). They respond at once, flow over the wheel's steps, move together (the same share of
        // the way, so the thumb stays on its rows), and change course without a jolt.
        const now = performance.now()
        const frameTime = now - paintedAt > 50 ? 1000 / 60 : now - paintedAt
        paintedAt = now
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const k = isReducedMotion ? 1 : 1 - Math.exp(-frameTime / glideTime)
        const from = painted ?? readLayout(rows, list)
        let extras = targetExtras.map((extra, i) => lerp(from.extras[i] ?? 0, extra, k))
        let thumb = {
          top: lerp(from.thumb.top, targetThumb.top, k),
          height: lerp(from.thumb.height, targetThumb.height, k),
        }
        const isSettled =
          Math.abs(thumb.top - targetThumb.top) < 0.1 &&
          Math.abs(thumb.height - targetThumb.height) < 0.1 &&
          extras.every((extra, i) => Math.abs(extra - targetExtras[i]!) < 0.1)
        if (isSettled) {
          extras = targetExtras
          thumb = targetThumb
        }
        // Never more than the free height (e.g. while the window shrinks): the rail would overflow
        const free = getFreeHeight(heights, available)
        const total = extras.reduce((a, b) => a + b, 0)
        if (total > free) extras = extras.map((extra) => (extra * free) / total)
        rows.forEach((row, i) => {
          row.style.setProperty('--toc-extra', `${extras[i]}px`)
        })
        list.style.setProperty('--thumb-top', `${thumb.top}px`)
        list.style.setProperty('--thumb-height', `${thumb.height}px`)
        painted = { extras, thumb }
        if (!isSettled) onScroll()
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

// The extra length (px) of each row, below its item. A long section gets a rail as long as the section (scaled: a page
// of `railContentLength` px of content would fill the rail) while it's on screen, opening over the first
// `openingShare` of a screen of it scrolled into view (and closing likewise). Only if the thumb (the screen, at the
// section's scale) travels down the rail: not for a section that fits on the screen (all of it is in view at once,
// there's no progress to show within it), nor for a few px (the list would twitch for nothing). Within the rail's free
// height: if two sections are open at once and don't both fit, they share it.
function getRowExtras(heights: number[], lengths: number[], onScreen: number[], available: number, viewHeight: number) {
  const free = getFreeHeight(heights, available)
  const extras = heights.map((height, i) => {
    const length = lengths[i]!
    if (length <= viewHeight || onScreen[i] === 0) return 0
    const extra = Math.min((length / railContentLength) * available - height, free)
    const travel = (height + extra) * (1 - viewHeight / length)
    if (extra < rowChangeMin || travel < rowChangeMin) return 0
    return extra * smoothstep(Math.min(1, onScreen[i]! / (viewHeight * openingShare)))
  })
  const total = extras.reduce((a, b) => a + b, 0)
  // Whole px: a sub-px change of the layout doesn't move the target (the rows would never settle)
  return extras.map((extra) => Math.floor(total > free ? (extra * free) / total : extra))
}
const openingShare = 0.25
function smoothstep(x: number) {
  return x * x * (3 - 2 * x)
}
const rowChangeMin = 24
const railContentLength = 11000
const thumbMin = 16
// The rail's height the items leave free, less some slack: filled to the last (fractional) px, the rail would overflow
// by rounding, and a classic scrollbar would pop up, narrowing the items (which re-wrap, changing the height...)
function getFreeHeight(heights: number[], available: number) {
  return Math.max(0, Math.floor(available - heights.reduce((a, b) => a + b, 0)) - 8)
}
// The glide's time constant (ms): 90% of the way in about 2.3x as long
const glideTime = 60
function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k
}

// The rail's height other than the list's (padding, title, "Back to top"), measured independently of the list's height:
// derived from it (the rail's rounded height minus the list's), it would change with every sub-px move of the rows,
// moving their target, which moves them... (the rows would jitter forever)
function getRailChromeHeight(rail: HTMLElement, list: HTMLElement) {
  const railRect = rail.getBoundingClientRect()
  const listRect = list.getBoundingClientRect()
  const last = rail.lastElementChild!.getBoundingClientRect()
  const style = getComputedStyle(rail)
  const above = listRect.top - railRect.top + rail.scrollTop - parseFloat(style.borderTopWidth)
  const below = last.bottom - listRect.bottom + parseFloat(style.paddingBottom)
  return above + below
}

// The height of the sticky header (the top bar, and the category tabs if any), 0 if it isn't sticky
function getStickyOffset() {
  const header = document.querySelector('.doc-page > header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  return header.getBoundingClientRect().height
}
