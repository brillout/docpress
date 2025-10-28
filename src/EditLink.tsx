export { EditLink }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { iconPencil } from './icons'
import { getRepoHref } from './components'

function EditLink({
  className,
  style,
  verbose,
}: { className?: string; style: React.CSSProperties; verbose?: boolean }) {
  const pageContext = usePageContext()
  const iconSize = 13
  const icon = (
    <img
      src={iconPencil}
      width={iconSize}
      height={iconSize}
      style={{
        marginRight: 6,
        position: 'relative',
        top: -1,
      }}
    />
  )
  const { urlPathname } = pageContext
  const fsPath = urlPathname === '/' ? '/index/+Page.tsx' : `${urlPathname}/+Page.mdx`
  const docsDir = pageContext.globalContext.config.docpress.docsDir ?? 'docs'
  const editLink = getRepoHref(`/${docsDir}/pages${fsPath}`, true)
  return (
    <a
      href={editLink}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingTop: 4,
        paddingBottom: 1,
        paddingLeft: 8,
        paddingRight: 8,
        border: '1px solid #e0e0e0',
        borderRadius: 7,
        fontSize: '0.91em',
        color: '#6c6c6c',
        background: '#f8f8f8',
        letterSpacing: 0.4,
        ...style,
      }}
    >
      {icon} Edit{verbose ? ' this page' : ''}
    </a>
  )
}
