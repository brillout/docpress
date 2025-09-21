export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from './Pre.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    pre: (props) => <Pre {...props} />,
  }
}
