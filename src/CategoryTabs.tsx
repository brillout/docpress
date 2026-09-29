export { CategoryTabs }
export { getCategories }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { getNavItemsWithComputed, type NavItemComputed } from './NavItemComponent.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { bodyMaxWidth } from './Layout.js'
import { cls } from './utils/cls.js'
import './CategoryTabs.css'

// `categoryTabs`: the categories (level-1 headings) as tabs below the top bar (desktop), each linking to its first page.
// The current page's category is underlined in its color. The left navigation lists the category's pages.
function CategoryTabs() {
  const categories = getCategories(usePageContext())
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
      <div className="category-tabs-content">
        {categories.map(
          ({ navItem, url, isCurrent }, i) =>
            url && (
              <a
                key={i}
                href={url}
                className={cls(['category-tab', isCurrent && 'is-current'])}
                aria-current={isCurrent ? 'true' : undefined}
                style={{ ['--color-category' as string]: navItem.color }}
              >
                {navItem.titleIcon && <img src={navItem.titleIcon} alt="" className="category-tab-icon" />}
                {parseMarkdownMini(navItem.titleInNav || navItem.title)}
              </a>
            ),
        )}
      </div>
    </nav>
  )
}

// The categories (level-1 headings), each with its pages (the first one is the category's link), and whether it holds
// the current page
function getCategories(pageContext: ReturnType<typeof usePageContext>) {
  const navItems = getNavItemsWithComputed(pageContext.resolved.navItemsAll, pageContext.urlPathname)
  const categories: {
    navItem: NavItemComputed
    url: string | null
    pages: { title: string; url: string }[]
    isCurrent: boolean
  }[] = []
  navItems.forEach((navItem) => {
    if (navItem.level === 1) categories.push({ navItem, url: null, pages: [], isCurrent: false })
    const category = categories[categories.length - 1]
    if (!category) return
    if (navItem.level === 2 && navItem.url) {
      category.url ??= navItem.url
      category.pages.push({ title: navItem.titleInNav || navItem.title, url: navItem.url })
    }
    if (navItem.isActive) category.isCurrent = true
  })
  return categories
}
