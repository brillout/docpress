export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from '../components/Pre.js'
import { CodeSnippets } from '../components/CodeSnippets.js'
import { CodeTabs, CodeTabPanel } from '../components/CodeTabs.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    CodeSnippets,
    CodeTabs,
    CodeTabPanel,
    pre: (props) => <Pre {...props} />,
  }
}
