export { generateChoiceGroupCode, expressionToAttribute }
export type { ChoiceNode }

import type { Config } from '../../types/Config.js'
import type { ChoiceGroup } from '../types.js'
import type { BlockContent, DefinitionContent, Parent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxFlowElementData } from 'mdast-util-mdx-jsx'
import { getVikeConfig } from 'vike/plugin'
import { assertUsage } from '../../utils/assert.js'
import { valueToEstree } from 'estree-util-value-to-estree'

type ChoiceNode = {
  choiceValue: string
  children: (BlockContent | DefinitionContent)[]
}

// TODO: determine icon representation for CHOICES_BUILT_IN given lack of SVG/file import support
// use SVG URLs for now
const CHOICES_BUILT_IN: NonNullable<Config['choices']> = {
  codeLang: {
    choices: [
      {
        name: 'JavaScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
      },
      {
        name: 'TypeScript',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
      },
    ],
    default: 'JavaScript',
  },
  pkgManager: {
    choices: [
      { name: 'npm', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original.svg' },
      { name: 'pnpm', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pnpm/pnpm-original.svg' },
      { name: 'Bun', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bun/bun-original.svg' },
      { name: 'Yarn', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/yarn/yarn-original.svg' },
    ],
    default: 'npm',
  },
}

function generateChoiceGroupCode(choiceNodes: ChoiceNode[], parent: Parent, hide: boolean = false): MdxJsxFlowElement {
  let lvl: number = 0
  const customHidden = choiceNodes.some((node) =>
    node.children.some((node) => node.type === 'containerDirective' && node.children[0]!.type !== 'code'),
  )
  const hidden = hide || customHidden

  const { choiceGroup, mergedChoiceNodes } = resolveChoiceGroupNodes(choiceNodes)
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []
  let data: MdxJsxFlowElementData = {}

  if (parent.data?.customDataParentChoiceGroup) {
    const { lvl: parentLvl } = parent.data.customDataParentChoiceGroup
    lvl = parentLvl + 1

    data.customDataParentChoiceGroup = parent.data.customDataParentChoiceGroup
    parent.data = undefined
  }

  for (const choiceNode of mergedChoiceNodes) {
    const choiceChildren: (BlockContent | DefinitionContent)[] = []
    if (choiceNode.children.every((node) => node.type === 'containerDirective')) {
      choiceChildren.push(...choiceNode.children.flatMap((node) => [...node.children]))
    } else {
      choiceChildren.push(...choiceNode.children)
    }

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-choice-value', value: choiceNode.choiceValue },
        { type: 'mdxJsxAttribute', name: 'className', value: 'choice' },
      ],
      children: choiceChildren,
      data: {
        ...(!Object.keys(CHOICES_BUILT_IN).includes(choiceGroup.name) && {
          customDataParentChoiceGroup: {
            name: choiceGroup.name,
            choice: choiceNode.choiceValue,
            default: choiceGroup.default,
            lvl,
          },
        }),
      },
    })
  }

  const choiceGroupAttr: ChoiceGroup = {
    ...choiceGroup,
    hidden: choiceNodes.length === 1 || hidden,
    lvl,
    isBuiltIn: Object.keys(CHOICES_BUILT_IN).includes(choiceGroup.name),
  }

  attributes.push(expressionToAttribute('choiceGroup', choiceGroupAttr))

  const choiceGroupNode: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'ChoiceGroup',
    attributes,
    children,
    data: {
      ...data,
      customDataChoiceGroup: choiceGroupAttr,
    },
  }

  if (lvl === 0) {
    return {
      type: 'mdxJsxFlowElement',
      name: 'CustomSelectsContainer',
      attributes: [],
      children: [choiceGroupNode],
    }
  }

  return choiceGroupNode
}

function resolveChoiceGroupNodes(choiceNodes: ChoiceNode[]) {
  const vikeConfig = getVikeConfig()
  const choices = choiceNodes.map((choiceNode) => choiceNode.choiceValue)
  const { choices: choicesConfig } = vikeConfig.config.docpress
  const choicesAll = { ...CHOICES_BUILT_IN, ...choicesConfig }

  const groupName = Object.keys(choicesAll).find((key) => {
    // get only the values that exist in both choices and choicesAll[key].choices
    const existsChoices = choicesAll[key]!.choices.filter((choice) => choices.includes(choice.name))
    // if nothing exists, skip this key
    if (existsChoices.length === 0) return false
    return true
  })
  assertUsage(groupName, `Missing group name for [${choices}]. Define it in +docpress.choices.`)

  const emptyChoices = choicesAll[groupName]!.choices.filter((choice) => !choices.includes(choice.name)).map(
    (choice) => choice.name,
  )

  const choiceGroup = {
    name: groupName,
    ...choicesAll[groupName]!,
    emptyChoices,
  }

  const mergedChoiceNodes: ChoiceNode[] = choiceGroup.choices.map((choice) => {
    const node = choiceNodes.find((node) => node.choiceValue === choice.name)

    return {
      choiceValue: choice.name,
      children: node?.children ?? [],
    }
  })

  return { choiceGroup, mergedChoiceNodes }
}

function expressionToAttribute(name: string, value: unknown): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          comments: [],
          body: [
            // @ts-ignore: Missing properties in type definition
            {
              type: 'ExpressionStatement',
              expression: valueToEstree(value),
            },
          ],
        },
      },
    },
  }
}
