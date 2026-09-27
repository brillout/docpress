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
  const activeId = useActiveSection(tocItems, !!tocProgress)
  // Empty, the column is still reserved: the page content doesn't shift between pages with and without sections
  if (tocItems.length === 0) return <div id="toc-rail" />
  return (
    <div id="toc-rail">
      <nav className={cls(['toc-rail-sticky', tocProgress && 'toc-progress'])} aria-labelledby="toc-rail-title">
        <div id="toc-rail-title" className="toc-rail-title">
          On this page
        </div>
        <ul>
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cls(['toc-item', `toc-item-level-${item.level}`, item.id === activeId && 'toc-item-active'])}
                aria-current={item.id === activeId ? 'location' : undefined}
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

// The active section is the last heading scrolled past the activation line (see below).
// With `withProgress`, each item also gets `--toc-progress` (0 to 1): how much of its section has been read.
function useActiveSection(tocItems: { id: string }[], withProgress: boolean) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { urlPathname } = usePageContext()
  const ids = tocItems.map((item) => item.id)
  const idsKey = ids.join(' ')
  useEffect(() => {
    if (ids.length === 0) return
    let frame: number | null = null
    const update = () => {
      frame = null
      const headings = ids.map((id) => document.getElementById(id)).filter((el) => el !== null)
      if (headings.length === 0) return
      // Measure once, then compute and paint
      const tops = headings.map((heading) => heading.getBoundingClientRect().top)
      const contentBottom = document.querySelector('.page-content')?.getBoundingClientRect().bottom ?? 0
      // A heading scrolled above the line is read. Within the last viewport of scrolling, the line moves down to the
      // viewport's bottom: the last sections, too short to ever reach the top, also get their turn.
      const lineTop = getStickyOffset() + 80
      const scrollRemaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      const line = lineTop + (window.innerHeight - lineTop) * Math.max(0, 1 - scrollRemaining / window.innerHeight)
      let activeIndex = 0
      tops.forEach((top, i) => {
        if (top <= line) activeIndex = i
      })
      setActiveId(headings[activeIndex]!.id)
      if (withProgress) {
        headings.forEach((heading, i) => {
          const start = tops[i]!
          const end = tops[i + 1] ?? contentBottom
          const progress = Math.min(1, Math.max(0, (line - start) / Math.max(1, end - start)))
          const item = document.querySelector<HTMLElement>(`#toc-rail .toc-item[href="#${CSS.escape(heading.id)}"]`)
          item?.style.setProperty('--toc-progress', String(progress))
        })
      }
    }
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
    // Also re-measure upon navigation: two pages can have the same headings
  }, [idsKey, urlPathname, withProgress])
  return activeId
}

function getStickyOffset() {
  const value = getComputedStyle(document.querySelector('.doc-page') ?? document.body).getPropertyValue(
    '--nav-head-sticky-offset',
  )
  return parseFloat(value) || 0
}
