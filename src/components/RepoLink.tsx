export { RepoLink }
export { getRepoHref }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'

function RepoLink({ path, text }: { path: string; text?: string | React.ReactNode }) {
  text = text || path
  const href = getRepoHref(path)
  return <a href={href}>{text}</a>
}

function getRepoHref(path: string, editMode = false) {
  const pageContext = usePageContext()
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  const viewMode = path.endsWith('/') && !editMode ? 'tree' : 'blob'
  const { github } = pageContext.globalContext.config.docpress
  let href = `${github}/${viewMode}/main${path}`
  if (editMode) href += '?plain=1'
  return href
}
