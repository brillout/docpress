export { CodeBlock }
export { CodeBlockTransformer }

import React from 'react'
import { assert } from '../utils/server'

type LineBreak = 'white-space' | 'break-word'

function CodeBlock({ children, lineBreak }: { children: any; lineBreak: LineBreak }) {
  assertLineBreak(lineBreak)
  const className = getClassName(lineBreak)
  return (
    <pre className={className}>
      <code>{children}</code>
    </pre>
  )
}

function CodeBlockTransformer({ children, lineBreak }: { children: any; lineBreak: LineBreak }) {
  assertLineBreak(lineBreak)
  const className = getClassName(lineBreak)
  return <div className={className}>{children}</div>
}

function getClassName(lineBreak: LineBreak) {
  return `with-line-break_${lineBreak}` as const
}

function assertLineBreak(lineBreak: LineBreak) {
  assert(
    lineBreak === 'white-space' || lineBreak === 'break-word',
    '`lineBreak` is currently the only use case for <CodeBlock>'
  )
}
