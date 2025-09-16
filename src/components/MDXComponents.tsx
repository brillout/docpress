import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from './Pre.js'

export const components: ReturnType<UseMdxComponents> = {
  pre: (props) => <Pre {...props} />,
}
