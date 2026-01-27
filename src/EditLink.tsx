export { EditLink }

import React from 'react'
import { usePageContext } from './renderer/usePageContext.js'
import { iconPencil } from './icons/index.js'
import { getRepoHref } from './components/index.js'

function EditLink({
  className,
  style,
  verbose,
}: { className?: string; style: React.CSSProperties; verbose?: boolean }) {
  const pageContext = usePageContext()
  const iconSize = 13
  const icon = <img src={iconPencil} width={iconSize} height={iconSize} style={{ marginRight: 6 }} />
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
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 8,
        paddingRight: 7,
        border: '1px solid #e0e0e0',
        borderRadius: 7,
        fontSize: '0.91em',
        color: '#6c6c6c',
        background: '#f8f8f8',
        letterSpacing: 0.4,
        lineHeight: 0,
        ...style,
      }}
    >
      {icon} Edit{verbose ? ' page' : ''}
    </a>
  )
}
