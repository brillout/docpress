export { useMDXComponents }

import React from 'react'
import type { UseMdxComponents } from '@mdx-js/mdx'
import { Pre } from '../components/Pre.js'
import { ChoiceGroup, CustomSelectsContainer } from '../components/ChoiceGroup.js'

const useMDXComponents: UseMdxComponents = () => {
  return {
    ChoiceGroup,
    CustomSelectsContainer,
    pre: (props) => <Pre {...props} />,
  }
}
