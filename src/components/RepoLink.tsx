export { RepoLink }
export { getRepoHref }

import React from 'react'
import { assert } from '../utils/server'
import { usePageContext } from '../renderer/usePageContext'

function isRepoLink(href: string) {
  return ['/examples/', '/docs/', '/boilerplates/', '.github/', '/test/', '/packages/'].some((start) =>
    href.startsWith(start),
  )
}

function RepoLink({ path, text, editMode }: { path: string; text?: string | React.ReactNode; editMode?: true }) {
  text = text || path
  const href = getRepoHref(path, editMode)
  return <a href={href}>{text}</a>
}

function getRepoHref(path: string, editMode?: true) {
  const pageContext = usePageContext()
  assert(isRepoLink(path), { path })
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  const viewMode = path.endsWith('/') && !editMode ? 'tree' : 'blob'
  const { githubRepository } = pageContext.config.projectInfo
  assert(githubRepository.startsWith('https://github.com/'))
  let href = `${githubRepository}/${viewMode}/main${path}`
  if (editMode) href += '?plain=1'
  return href
}
