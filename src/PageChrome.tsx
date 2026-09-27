export { PageHeader }
export { PageFooter }

import React, { useState } from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { parseMarkdownMini } from './parseMarkdownMini.js'
import { usePageSourcePath } from './EditLink.js'
import { getRepoHref } from './components/index.js'
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

// Copies the page's Markdown source, e.g. to paste it into an LLM. Fetched from the repository upon click (not
// shipped with the page).
function CopyPageButton() {
  const { github } = usePageContext().globalContext.config.docpress
  const sourcePath = usePageSourcePath()
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const repo = /^https:\/\/github\.com\/([^/]+\/[^/]+)/.exec(github)?.[1]
  if (!repo) return null
  const sourceUrl = `https://raw.githubusercontent.com/${repo}/main${sourcePath}`
  const onClick = async () => {
    const text = fetch(sourceUrl).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${sourceUrl}`)
      return res.text()
    })
    try {
      // Safari only allows writing to the clipboard synchronously within the click: pass the pending text
      if (typeof ClipboardItem !== 'undefined') {
        const blob = text.then((t) => new Blob([t], { type: 'text/plain' }))
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })])
      } else {
        await navigator.clipboard.writeText(await text)
      }
      setStatus('copied')
    } catch (err) {
      console.error(err)
      setStatus('failed')
    }
    setTimeout(() => setStatus('idle'), 1500)
  }
  return (
    <button type="button" className="copy-page-button" onClick={onClick}>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {status === 'copied' ? (
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      <span className="copy-page-label">
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy page'}
      </span>
    </button>
  )
}

// Previous / next page, and "Edit this page"
function PageFooter() {
  const pageContext = usePageContext()
  const { pagePrev, pageNext } = pageContext.resolved
  const editUrl = getRepoHref(usePageSourcePath(), true)
  return (
    <footer className="page-footer">
      {(pagePrev || pageNext) && (
        <nav className="page-pagination" aria-label="Pagination">
          {pagePrev ? (
            <a href={pagePrev.url} rel="prev" className="page-pagination-link">
              <span className="page-pagination-label">Previous</span>
              <span className="page-pagination-title">{parseMarkdownMini(pagePrev.title)}</span>
            </a>
          ) : (
            <span />
          )}
          {pageNext && (
            <a href={pageNext.url} rel="next" className="page-pagination-link page-pagination-next">
              <span className="page-pagination-label">Next</span>
              <span className="page-pagination-title">{parseMarkdownMini(pageNext.title)}</span>
            </a>
          )}
        </nav>
      )}
      <a href={editUrl} className="page-edit-link">
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        Edit this page
      </a>
    </footer>
  )
}
