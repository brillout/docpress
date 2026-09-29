export { DocsOverview }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext.js'
import { getCategories } from '../CategoryTabs.js'
import { parseMarkdownMini } from '../parseMarkdownMini.js'
import './DocsOverview.css'

// A docs home: each category (level-1 heading) as a card, with its icon, its color, and its first pages. For the page
// the landing page's "Docs" link goes to (the `docsUrl` setting).
function DocsOverview({ pagesPerCategory = 5 }: { pagesPerCategory?: number }) {
  const categories = getCategories(usePageContext()).filter((category) => category.url)
  return (
    <div className="docs-overview">
      {categories.map(({ navItem, url, pages }, i) => (
        <section key={i} className="docs-overview-card" style={{ ['--color-category' as string]: navItem.color }}>
          {/* No `id`: not one of the page's sections */}
          <h2 className="docs-overview-title">
            <a href={url!} className="docs-overview-link">
              {navItem.titleIcon && <img src={navItem.titleIcon} alt="" className="docs-overview-icon" />}
              {parseMarkdownMini(navItem.titleInNav || navItem.title)}
            </a>
          </h2>
          <ul>
            {pages.slice(0, pagesPerCategory).map((page) => (
              <li key={page.url}>
                <a href={page.url} className="docs-overview-link">
                  {parseMarkdownMini(page.title)}
                </a>
              </li>
            ))}
          </ul>
          {pages.length > pagesPerCategory && (
            <a href={url!} className="docs-overview-link docs-overview-all">
              All {pages.length} pages
            </a>
          )}
        </section>
      ))}
    </div>
  )
}
