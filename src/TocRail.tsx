export { TocRail }
export { tocRailWidth }
export { viewTocRail }

import React, { useEffect, useState } from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import './TocRail.css'

const tocRailWidth = 220
// Three columns: left navigation + page content + "On this page"
const viewTocRail = 1280

// The right-hand "On this page" rail. Server-rendered from the page's `##`/`###` headings; the active item is set
// after hydration (no active item in the HTML => no hydration mismatch).
function TocRail() {
  const pageContext = usePageContext()
  const { tocItems } = pageContext.resolved
  const activeId = useActiveSection(tocItems.map((item) => item.id))
  if (tocItems.length === 0) return null
  return (
    <aside id="toc-rail" aria-labelledby="toc-rail-title">
      <nav className="toc-rail-sticky">
        <div id="toc-rail-title" className="toc-rail-title">
          On this page
        </div>
        <ul>
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={['toc-item', `toc-item-level-${item.level}`, item.id === activeId && 'toc-item-active']
                  .filter(Boolean)
                  .join(' ')}
                aria-current={item.id === activeId ? 'location' : undefined}
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
function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const idsKey = ids.join(' ')
  useEffect(() => {
    if (ids.length === 0) return
    let frame: number | null = null
    const update = () => {
      frame = null
      const headings = ids.map((id) => document.getElementById(id)).filter((el) => el !== null)
      if (headings.length === 0) return
      const offset = getStickyOffset() + 80
      let active = headings[0]!
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset) active = heading
        else break
      }
      // Scrolled to the bottom: the last sections may be too short to ever reach the top
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (isAtBottom) active = headings[headings.length - 1]!
      setActiveId(active.id)
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
  }, [idsKey])
  return activeId
}

function getStickyOffset() {
  const value = getComputedStyle(document.querySelector('.doc-page') ?? document.body).getPropertyValue(
    '--nav-head-sticky-offset',
  )
  return parseFloat(value) || 0
}
