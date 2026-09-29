export { CategoryTabs }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { bodyMaxWidth } from './Layout.js'
import { cls } from './utils/cls.js'
import './CategoryTabs.css'

// `categoryTabs`: the categories (level-1 headings) as tabs below the top bar (desktop), each linking to its first page.
// The current page's category is underlined in its color. The left navigation lists the category's pages.
function CategoryTabs() {
  const { categories } = usePageContext().resolved
  return (
    <nav
      className="category-tabs"
      aria-label="Categories"
      style={{
        // The bottom hairline, and copies of the row left and right of it: it spans the viewport (like the top bar)
        boxShadow: [
          '0 1px 0 var(--dp-color-border)',
          `-${bodyMaxWidth}px 0 0 var(--dp-color-bg)`,
          `${bodyMaxWidth}px 0 0 var(--dp-color-bg)`,
          `-${bodyMaxWidth}px 1px 0 var(--dp-color-border)`,
          `${bodyMaxWidth}px 1px 0 var(--dp-color-border)`,
        ].join(', '),
      }}
    >
      <div
        className="category-tabs-content"
        // In the frame, like the top bar's content, also on pages without left navigation (they aren't capped): the
        // first tab stays under the logo from page to page
        style={{ maxWidth: bodyMaxWidth, margin: '0 auto', boxSizing: 'border-box' }}
      >
        {categories.map(
          ({ title, titleIcon, color, pages, isCurrent }, i) =>
            pages[0] && (
              <a
                key={i}
                href={pages[0].url}
                className={cls(['category-tab', isCurrent && 'is-current'])}
                aria-current={isCurrent ? 'true' : undefined}
                style={{ ['--color-category' as string]: color }}
              >
                {titleIcon && <img src={titleIcon} alt="" className="category-tab-icon" />}
                {parseMarkdownMini(title)}
              </a>
            ),
        )}
      </div>
    </nav>
  )
}
