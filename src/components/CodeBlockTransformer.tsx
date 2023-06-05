export { CodeBlockTransformer }

import React from 'react'
import { assert } from '../utils/server'
/* Imorted in /src/css/index.css instead
import './CodeBlockTransformer.css'
*/

type LineBreak = 'white-space' | 'break-word'

function CodeBlockTransformer({ children, lineBreak }: { children: any; lineBreak: LineBreak }) {
  assert(
    lineBreak === 'white-space' || lineBreak === 'break-word',
    '`lineBreak` is currently the only use case for <CodeBlockTransformer>'
  )
  const className = `with-line-break_${lineBreak}` as const
  return <div className={className}>{children}</div>
}
