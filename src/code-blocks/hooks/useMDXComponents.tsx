export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from '../components/Pre.js'
import { CodeSnippets } from '../components/CodeSnippets.js'
import { ChoiceGroup } from '../components/ChoiceGroup.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    ChoiceGroup,
    CodeSnippets,
    pre: (props) => <Pre {...props} />,
  }
}
