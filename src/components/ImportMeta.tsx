import React from 'react'
import { assert } from '../utils'

export { ImportMeta }

function ImportMeta({ prop }: { prop: string }) {
  assert(!prop.startsWith('import'))
  assert(!prop.startsWith('.'))
  const text = 'imp' + 'ort.meta.' + prop
  return <code>{text}</code>
}
