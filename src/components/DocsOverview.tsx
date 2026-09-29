export { DocsOverview }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext.js'
import { getCategories } from '../CategoryTabs.js'
import { parseMarkdownMini } from '../parseMarkdownMini.js'
import { SearchLink } from '../docsearch/SearchLink.js'
import './DocsOverview.css'

type StartLink = {
  href: string
  /** Default: the page's title */
  title?: string
  description?: string
}

// A docs home: a hero (title, lead, search), the pages to start with, and the categories (level-1 headings) as cards,
// with their icon, color, description (the headings' `description`), and first pages. Meant for a wide page without
// title, e.g. with `pageDesign: { hideTitle: true, contentMaxWidth: 1120 }`, which the landing page's "Docs" link goes
// to (`docsUrl`).
function DocsOverview({
  title,
  children,
  start = [],
  pagesPerCategory = 5,
}: {
  /** The hero's title. Without it, no hero: only the cards. */
  title?: string
  /** The hero's lead */
  children?: React.ReactNode
  /** The pages to start with, as large cards. A category whose pages are all here isn't repeated below. */
  start?: StartLink[]
  pagesPerCategory?: number
}) {
  const pageContext = usePageContext()
  const { algolia } = pageContext.globalContext.config.docpress
  const categories = getCategories(pageContext).filter((category) => category.url)
  const findPage = (href: string) => {
    for (const category of categories) {
      const page = category.pages.find((page) => page.url === href)
      if (page) return { page, category }
    }
    return null
  }
  const startHrefs = new Set(start.map((link) => link.href))
  const browse = categories.filter((category) => !category.pages.every((page) => startHrefs.has(page.url)))
  return (
    <div className="docs-overview">
      {title && (
        <header className="docs-overview-hero">
          <h1>{title}</h1>
          {children && <div className="docs-overview-lead">{children}</div>}
          {algolia && <SearchLink className="docs-overview-search" label="Search the docs" />}
        </header>
      )}
      {start.length > 0 && (
        <section className="docs-overview-section" aria-label="Start here">
          {/* No `id`: not one of the page's sections */}
          <h2 className="docs-overview-heading">Start here</h2>
          <div className="docs-overview-start">
            {start.map((link) => {
              const found = findPage(link.href)
              const navItem = found?.category.navItem
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="docs-overview-link docs-overview-start-card"
                  style={{ ['--color-category' as string]: navItem?.color }}
                >
                  {navItem?.titleIcon && <CategoryIcon src={navItem.titleIcon} />}
                  <span className="docs-overview-start-text">
                    <span className="docs-overview-start-title">
                      {link.title ?? parseMarkdownMini(found?.page.title ?? link.href)}
                    </span>
                    {link.description && <span className="docs-overview-description">{link.description}</span>}
                  </span>
                  <ArrowIcon />
                </a>
              )
            })}
          </div>
        </section>
      )}
      <section className="docs-overview-section" aria-label="Browse the docs">
        {title && <h2 className="docs-overview-heading">Browse the docs</h2>}
        <div className="docs-overview-grid">
          {browse.map(({ navItem, url, pages }, i) => (
            <div key={i} className="docs-overview-card" style={{ ['--color-category' as string]: navItem.color }}>
              <a href={url!} className="docs-overview-link docs-overview-card-head">
                {navItem.titleIcon && <CategoryIcon src={navItem.titleIcon} />}
                <span className="docs-overview-card-title">
                  {parseMarkdownMini(navItem.titleInNav || navItem.title)}
                </span>
              </a>
              {navItem.description && <p className="docs-overview-description">{navItem.description}</p>}
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
                  <ArrowIcon />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// The category's icon on a tile tinted with its color
function CategoryIcon({ src }: { src: string }) {
  return (
    <span className="docs-overview-icon" aria-hidden="true">
      <img src={src} alt="" />
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg
      className="docs-overview-arrow"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8h9M8.5 4l4 4-4 4" />
    </svg>
  )
}
