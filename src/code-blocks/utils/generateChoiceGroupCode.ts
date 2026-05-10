export { generateChoiceGroupCode, generateTabs }
export type { ChoiceNode }

import type { BlockContent, DefinitionContent, Parent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import { getVikeConfig } from 'vike/plugin'
import { assertUsage } from '../../utils/assert.js'
import { valueToEstree } from 'estree-util-value-to-estree'

type ChoiceNode = {
  choiceValue: string
  children: (BlockContent | DefinitionContent)[]
}

const CHOICES_BUILT_IN: Record<string, { choices: string[]; default: string }> = {
  codeLang: {
    choices: ['JavaScript', 'TypeScript'],
    default: 'JavaScript',
  },
  pkgManager: {
    choices: ['npm', 'pnpm', 'Bun', 'Yarn'],
    default: 'npm',
  },
}

function generateChoiceGroupCode(choiceNodes: ChoiceNode[], parent: Parent, hide: boolean = false): MdxJsxFlowElement {
  let lvl: number = 0
  const { choiceGroup, mergedChoiceNodes } = resolveChoiceGroupNodes(choiceNodes)
  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

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
        customDataParentChoiceGroup: {
          name: choiceGroup.name,
          choice: choiceNode.choiceValue,
          default: choiceGroup.default,
          lvl,
        },
      },
    })
  }

  if (parent.data?.customDataParentChoiceGroup) {
    const { lvl: parentLvl, ...parentChoiceGroup } = parent.data.customDataParentChoiceGroup

    attributes.push(expressionToAttribute('parentChoiceGroup', parentChoiceGroup))

    lvl = parentLvl + 1
    parent.data.customDataParentChoiceGroup = undefined
  }

  attributes.push(
    expressionToAttribute('choiceGroup', { ...choiceGroup, hidden: choiceNodes.length === 1 || hide, lvl }),
  )

  const choiceGroupNode: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'ChoiceGroup',
    attributes,
    children,
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

function generateTabs(choiceNodes: ChoiceNode[]): MdxJsxFlowElement {
  const { choiceGroup, mergedChoiceNodes } = resolveChoiceGroupNodes(choiceNodes)

  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  for (const choiceNode of mergedChoiceNodes) {
    const choiceChildren: (BlockContent | DefinitionContent)[] = []
    if (choiceNode.children.every((node) => node.type === 'containerDirective')) {
      choiceChildren.push(...choiceNode.children.flatMap((node) => [...node.children]))
    } else {
      choiceChildren.push(...choiceNode.children)
    }

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'TabPanel',
      attributes: [],
      children: choiceChildren,
    })
  }

  attributes.push(expressionToAttribute('choiceGroup', choiceGroup))

  return {
    type: 'mdxJsxFlowElement',
    name: 'TabsComponent',
    attributes,
    children,
  }
}

function resolveChoiceGroupNodes(choiceNodes: ChoiceNode[]) {
  const vikeConfig = getVikeConfig()
  const choices = choiceNodes.map((choiceNode) => choiceNode.choiceValue)
  const { choices: choicesConfig } = vikeConfig.config.docpress
  const choicesAll = { ...CHOICES_BUILT_IN, ...choicesConfig }

  const groupName = Object.keys(choicesAll).find((key) => {
    // get only the values that exist in both choices and choicesAll[key].choices
    const existsChoices = choicesAll[key]!.choices.filter((choice) => choices.includes(choice))
    // if nothing exists, skip this key
    if (existsChoices.length === 0) return false
    return true
  })
  assertUsage(groupName, `Missing group name for [${choices}]. Define it in +docpress.choices.`)

  const disabled = choicesAll[groupName]!.choices.filter((choice) => !choices.includes(choice))

  const choiceGroup = {
    name: groupName,
    ...choicesAll[groupName]!,
    disabled,
  }

  const mergedChoiceNodes: ChoiceNode[] = choiceGroup.choices.map((choice) => {
    const node = choiceNodes.find((node) => node.choiceValue === choice)

    return {
      choiceValue: choice,
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
