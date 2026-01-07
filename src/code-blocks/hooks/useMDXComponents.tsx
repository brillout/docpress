export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from '../components/Pre.js'
import { CodeSnippets } from '../components/CodeSnippets.js'
import { CodeGroup } from '../components/CodeGroup.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    CodeGroup,
    CodeSnippets,
    pre: (props) => <Pre {...props} />,
  }
}
