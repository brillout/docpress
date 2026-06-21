export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from '../components/Pre.js'
import { ChoiceGroup, ChoiceGroupContainer } from '../components/ChoiceGroup.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    ChoiceGroup,
    ChoiceGroupContainer,
    pre: (props) => <Pre {...props} />,
  }
}
