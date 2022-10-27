export { CodeBlock }

import React from 'react'
import { assert, objectAssign } from '../utils'

function CodeBlock({ children, lineBreak }: { children: any; lineBreak?: true }) {
  assert(lineBreak, '`lineBreak: true` is currently the only use case for <CodeBlock>')
  const style = {}
  if (lineBreak) {
    objectAssign(style, {
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      whiteSpace: 'initial',
      paddingRight: '16px !important'
    })
  }
  return (
    <pre>
      <code style={style}>{children}</code>
    </pre>
  )
}
