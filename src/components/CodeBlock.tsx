export { CodeBlock }

import React from 'react'
import { assert } from '../utils/server'

function CodeBlock({ children, lineBreak }: { children: any; lineBreak?: 'white-space' | 'break-word' }) {
  assert(
    lineBreak === 'white-space' || lineBreak === 'break-word',
    '`lineBreak` is currently the only use case for <CodeBlock>'
  )
  const style: React.CSSProperties = {}
  if (lineBreak) {
    style.whiteSpace = 'break-spaces'
    style.paddingRight = '16px !important'
    if (lineBreak === 'break-word') {
      style.wordWrap = 'break-word'
      style.wordBreak = 'break-all'
    }
  }
  return (
    <pre>
      <code style={style}>{children}</code>
    </pre>
  )
}
