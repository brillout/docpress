export { EditLink }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { iconPencil } from './icons'
import { getRepoHref } from './components'

function EditLink({ className, style }: { className?: string; style: React.CSSProperties }) {
  const pageContext = usePageContext()
  const iconSize = 17
  const icon = (
    <img
      src={iconPencil}
      width={iconSize}
      height={iconSize}
      style={{
        marginRight: 9,
        position: 'relative',
        top: -1,
      }}
    />
  )
  const { urlPathname } = pageContext
  const fsPath = urlPathname === '/' ? '/index/+Page.tsx' : `${urlPathname}/+Page.mdx`
  const docsDir = pageContext.config.docsDir ?? 'docs'
  const editLink = getRepoHref(`/${docsDir}/pages${fsPath}`, true)
  return (
    <a href={editLink} className={className} style={{ display: 'flex', alignItems: 'center', ...style }}>
      {icon} Edit this page
    </a>
  )
}
