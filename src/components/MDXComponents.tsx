export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from './Pre.js'
import { CodeSnippets } from './CodeSnippets.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    CodeSnippets,
    pre: (props) => <Pre {...props} />,
  }
}
