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

// Height of all progress segments together, distributed proportionally to the sections' lengths
const progressTrackHeight = 380
const progressSegmentHeightMin = 28

// The right-hand "On this page" rail. Server-rendered from the page's `##`/`###` headings; the active item (and the
// reading progress) is set after hydration: no active item in the HTML => no hydration mismatch. The progress
// segments' heights are computed from the build-time section lengths, so they don't shift the layout on load.
function TocRail() {
  const pageContext = usePageContext()
  const { tocItems } = pageContext.resolved
  const { tocProgress } = pageContext.globalContext.config.docpress
  const activeId = useActiveSection(tocItems, !!tocProgress)
  if (tocItems.length === 0) return null
  const lengthTotal = tocItems.reduce((sum, item) => sum + item.length, 0) || 1
  return (
    <aside id="toc-rail" aria-labelledby="toc-rail-title">
      <nav className={cls(['toc-rail-sticky', tocProgress && 'toc-progress'])}>
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
                style={
                  !tocProgress
                    ? undefined
                    : {
                        minHeight: Math.max(
                          progressSegmentHeightMin,
                          Math.round((progressTrackHeight * item.length) / lengthTotal),
                        ),
                      }
                }
              >
                {parseMarkdownMini(item.title)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

// The active section is the last heading scrolled past the top of the viewport (below the sticky top nav).
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
      const line = getStickyOffset() + 80
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      let active = headings[0]!
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) active = heading
        else break
      }
      // Scrolled to the bottom: the last sections may be too short to ever reach the top
      if (isAtBottom) active = headings[headings.length - 1]!
      setActiveId(active.id)
      if (withProgress) {
        const contentBottom = document.querySelector('.page-content')?.getBoundingClientRect().bottom ?? 0
        headings.forEach((heading, i) => {
          const start = heading.getBoundingClientRect().top
          const end = headings[i + 1]?.getBoundingClientRect().top ?? contentBottom
          const progress = isAtBottom ? 1 : Math.min(1, Math.max(0, (line - start) / Math.max(1, end - start)))
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
