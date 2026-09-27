export { EditLink }
export { usePageSourcePath }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { cls } from './utils/cls.js'
import { getRepoHref } from './components/index.js'

function EditLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const editUrl = getRepoHref(usePageSourcePath(), true)
  return (
    <a href={editUrl} className={cls(['edit-link', className])}>
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
      {children}
    </a>
  )
}

// The page's source file, relative to the repository root
function usePageSourcePath() {
  const pageContext = usePageContext()
  const docsDir = pageContext.globalContext.config.docpress.docsDir ?? 'docs'
  // The file defining the page (e.g. `/pages/AuthJS/+Page.mdx`): the URL can differ from the directory (`+route`)
  const pageFile = pageContext.configEntries?.Page?.[0]?.configDefinedByFile
  if (pageFile) return `/${docsDir}${pageFile}`
  const { urlPathname } = pageContext
  const fsPath = urlPathname === '/' ? '/index/+Page.tsx' : `${urlPathname}/+Page.mdx`
  return `/${docsDir}/pages${fsPath}`
}
