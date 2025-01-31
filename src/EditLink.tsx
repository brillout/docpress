export { EditLink }

import React from 'react'
import { usePageContext } from './renderer/usePageContext'
import { iconPencil } from './icons'
import { getRepoHref } from './components'
import { Style } from './utils/Style'
import { css } from './utils/css'

function EditLink() {
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
  const editLink = getRepoHref(`/docs/pages${fsPath}`, true)
  return (
    <a
      href={editLink}
      id="edit-link"
      style={{ float: 'right', marginTop: 6, padding: 10, display: 'flex', alignItems: 'center' }}
    >
      {icon} Edit this page
      <Style>{getStyle()}</Style>
    </a>
  )
  function getStyle() {
    return css`
@container container-viewport (max-width: 800px) {
  #edit-link {
    display: none !important;
  }
}`
  }
}
