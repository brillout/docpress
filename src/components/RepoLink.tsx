import React from 'react'
import { assert } from '../utils/server'
import { usePageContext } from '../renderer/usePageContext'

export { RepoLink }
export { isRepoLink }

function isRepoLink(href: string) {
  return ['/examples/', '/docs/', '/boilerplates/', '.github/', '/test/'].some((start) => href.startsWith(start))
}

function RepoLink({ path, text, editMode }: { path: string; text?: string | JSX.Element; editMode?: true }) {
  const pageContext = usePageContext()
  assert(isRepoLink(path), { path })
  text = text || path
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  const viewMode = (editMode && 'edit') || (path.endsWith('/') && 'tree') || 'blob'
  const { githubRepository } = pageContext.config.projectInfo
  assert(githubRepository.startsWith('https://github.com/'))
  const href = `${githubRepository}/${viewMode}/main${path}`
  return <a href={href}>{text}</a>
}
