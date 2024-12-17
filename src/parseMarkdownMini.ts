export { parseMarkdownMini }

import React from 'react'

function parseMarkdownMini(markdown: string): JSX.Element {
  type Part = { nodeType: 'text' | 'code'; content: string }
  const parts: Part[] = []
  let current: Part | undefined
  markdown.split('').forEach((letter) => {
    if (letter === '`') {
      if (current?.nodeType === 'code') {
        // </code>
        parts.push(current)
        current = undefined
      } else {
        // <code>
        if (current) {
          parts.push(current)
        }
        current = { nodeType: 'code', content: '' }
      }
    } else {
      if (!current) {
        current = { nodeType: 'text', content: '' }
      }
      current.content += letter
    }
  })
  if (current) {
    parts.push(current)
  }

  const parsed = React.createElement(
    React.Fragment,
    {},
    ...parts.map((part, i) =>
      React.createElement(part.nodeType === 'code' ? 'code' : React.Fragment, { key: i }, part.content),
    ),
  )

  return parsed
}
