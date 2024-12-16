import React from 'react'
import { assert } from '../utils/server'
import { usePageContext } from '../renderer/usePageContext'

export { RepoLink }
export { isRepoLink }
export { getRepoHref }

function isRepoLink(href: string) {
  return ['/examples/', '/docs/', '/boilerplates/', '.github/', '/test/'].some((start) => href.startsWith(start))
}

function RepoLink({ path, text, editMode }: { path: string; text?: string | JSX.Element; editMode?: true }) {
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
