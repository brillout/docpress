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
      </nav>
    </div>
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
      // Just jumped to a section (e.g. a click on the rail): it's the active one while its heading is in view
      const jumpedTo = ids.indexOf(decodeURIComponent(window.location.hash.slice(1)))
      const jumpedToTop = tops[jumpedTo]
      if (jumpedToTop != null && jumpedToTop >= stickyOffset - 1 && jumpedToTop < window.innerHeight) {
        activeIndex = jumpedTo
      }
      setActiveIndex(activeIndex)
      if (withProgress) {
        const items = document.querySelectorAll<HTMLElement>('#toc-rail .toc-item')
        tops.forEach((start, i) => {
          if (start === null) return
          const end = tops.slice(i + 1).find((top) => top !== null) ?? contentBottom
          const progress = Math.min(1, Math.max(0, (line - start) / Math.max(1, end - start)))
          items[i]?.style.setProperty('--toc-progress', String(progress))
        })
      }
    }
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('hashchange', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('hashchange', onScroll)
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
