export { PageHeader }
export { PageFooter }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { EditLink } from './EditLink.js'
import { pageToMarkdown } from './pageToMarkdown.js'
import { useCopy, CopyAnnouncement, CopyStatusIcon } from './utils/useCopy.js'
import './PageChrome.css'

// Breadcrumb, title, and "Copy page"
function PageHeader({ title }: { title: React.JSX.Element }) {
  const { breadcrumb } = usePageContext().resolved
  return (
    <header className="page-header">
      {breadcrumb.length > 0 && (
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={i}>{parseMarkdownMini(crumb)}</span>
          ))}
        </nav>
      )}
      <div className="page-title-row">
        <h1>{title}</h1>
        <CopyPageButton />
      </div>
    </header>
  )
}

// Copies the page as Markdown, e.g. to paste it into an LLM (see pageToMarkdown.ts)
function CopyPageButton() {
  const { status, copy } = useCopy()
  // The label doesn't change (the button keeps its width): the icon and a screen reader announcement show the status
  return (
    <>
      <button type="button" className="copy-page-button scale-on-press" onClick={() => copy(pageToMarkdown())}>
        <CopyStatusIcon status={status} />
        <span className="copy-page-label">Copy page</span>
      </button>
      <CopyAnnouncement status={status} />
    </>
  )
}

// Previous / next page, and "Edit this page"
function PageFooter() {
  const pageContext = usePageContext()
  const { pagePrev, pageNext } = pageContext.resolved
  return (
    <footer className="page-footer">
      {(pagePrev || pageNext) && (
        <nav className="page-pagination" aria-label="Pagination">
          {pagePrev ? (
            <a href={pagePrev.url} rel="prev" className="page-pagination-link scale-on-press-subtle">
              <span className="page-pagination-label">Previous</span>
              <span className="page-pagination-title">{parseMarkdownMini(pagePrev.title)}</span>
            </a>
          ) : (
            <span />
          )}
          {pageNext && (
            <a
              href={pageNext.url}
              rel="next"
              className="page-pagination-link page-pagination-next scale-on-press-subtle"
            >
              <span className="page-pagination-label">Next</span>
              <span className="page-pagination-title">{parseMarkdownMini(pageNext.title)}</span>
            </a>
          )}
        </nav>
      )}
      <EditLink className="page-edit-link">Edit this page</EditLink>
    </footer>
  )
}
