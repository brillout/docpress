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
// that's on screen, magnified.
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
// With `withProgress`, the thumb is a lens: the part of the page on screen, magnified (see update()).
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
      // A row: the item, and (with progress) the rail below it
      const rows = items.map((item) => item.parentElement!)
      let thumb: { top: number; bottom: number } | null = null
      if (withProgress) {
        // The thumb is a lens: the part of the page on screen, magnified (`lens` px), in a list otherwise compact.
        // Each section on screen gets its share of the lens below its item, so the items of the headings on screen
        // move along the thumb like the headings move along the screen, and the list's length doesn't change.
        const viewTop = stickyOffset
        const viewBottom = window.innerHeight
        const viewHeight = Math.max(1, viewBottom - viewTop)
        const sections = tops.map((start, i) => {
          if (start === null) return null
          const end = tops.slice(i + 1).find((top) => top !== null) ?? contentBottom
          return { start, end, visible: Math.max(0, Math.min(end, viewBottom) - Math.max(start, viewTop)) }
        })
        const heights = items.map((item) => item.getBoundingClientRect().height)
        const available =
          parseFloat(getComputedStyle(rail).maxHeight) - (rail.scrollHeight - list.getBoundingClientRect().height)
        const free = available - heights.reduce((a, b) => a + b, 0)
        const lens = Math.max(0, Math.min(free, available * lensShare))
        rows.forEach((row, i) => {
          const extra = `${(lens * (sections[i]?.visible ?? 0)) / viewHeight}px`
          if (row.style.getPropertyValue('--toc-extra') !== extra) row.style.setProperty('--toc-extra', extra)
          // Attributes (not classes): React re-renders the class names
          items[i]?.toggleAttribute('data-visible', (sections[i]?.visible ?? 0) > 0)
        })
        // A point of the page on the rail: its section's item spans the whole section, compressed; the part on screen
        // also spans its share of the lens
        const listTop = list.getBoundingClientRect().top
        const rowTops = rows.map((row) => row.getBoundingClientRect().top - listTop)
        const toRail = (y: number) => {
          let i = -1
          sections.forEach((section, j) => {
            if (section && section.start <= y) i = j
          })
          const section = sections[i]
          if (!section) return 0
          const onScreen = Math.max(0, Math.min(y, viewBottom) - Math.max(section.start, viewTop))
          const length = Math.max(1, section.end - section.start)
          return (
            rowTops[i]! +
            (heights[i]! * (Math.min(y, section.end) - section.start)) / length +
            (lens * onScreen) / viewHeight
          )
        }
        const first = sections.find((section) => section !== null)
        const from = Math.max(viewTop, first?.start ?? Infinity)
        const to = Math.min(viewBottom, contentBottom)
        if (to > from) thumb = { top: toRail(from), bottom: toRail(to) }
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const pageProgress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1
        rail.style.setProperty('--page-progress', String(pageProgress))
      } else {
        const listTop = list.getBoundingClientRect().top
        const rect = rows[activeIndex]?.getBoundingClientRect()
        if (rect) thumb = { top: rect.top - listTop, bottom: rect.bottom - listTop }
      }
      let { top, bottom } = thumb ?? { top: 0, bottom: 0 }
      // Never a sliver (e.g. a list too long to leave room for the lens)
      if (thumb && bottom - top < thumbMin) {
        const listHeight = list.getBoundingClientRect().height
        top = Math.min(Math.max(0, (top + bottom - thumbMin) / 2), listHeight - thumbMin)
        bottom = top + thumbMin
      }
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

const thumbMin = 16
// The lens (the thumb, with reading progress) takes this share of the rail's height, if the list leaves room for it
const lensShare = 0.22

// The height of the sticky header (the top bar, and the category tabs if any), 0 if it isn't sticky
function getStickyOffset() {
  const header = document.querySelector('.doc-page > header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  return header.getBoundingClientRect().height
}
