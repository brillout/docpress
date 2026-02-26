export { generateChoiceGroupCode }
export type { ChoiceNode }

import type { VikeConfig } from 'vike/types'
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

function generateChoiceGroupCode(choiceNodes: ChoiceNode[], parent?: Parent): MdxJsxFlowElement {
  const vikeConfig = getVikeConfig()
  const choices = choiceNodes.map((choiceNode) => choiceNode.choiceValue)
  const choiceGroup = findChoiceGroup(vikeConfig, choices)
  console.log('vikeConfig.config.docpress', vikeConfig.config.docpress)

  const mergedChoiceNodes = choiceGroup.choices.map((choice) => {
    const node = choiceNodes.find((n) => n.choiceValue === choice)

    return {
      choiceValue: choice,
      children: node?.children ?? [],
    }
  })

  const attributes: MdxJsxAttribute[] = []
  const children: MdxJsxFlowElement[] = []

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'choiceGroup',
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
            { type: 'ExpressionStatement', expression: valueToEstree(choiceGroup) },
          ],
        },
      },
    },
  })

  if (choiceNodes.length === 1) {
    attributes.push({ type: 'mdxJsxAttribute', name: 'hide' })
  }

  let initLvl: number

  switch (parent?.type) {
    case 'root':
      initLvl = 0
      break
    case 'mdxJsxFlowElement':
      initLvl = 1
      break

    default:
      initLvl = 0
      break
  }

  attributes.push({ type: 'mdxJsxAttribute', name: 'lvl', value: `${initLvl}` })

  for (const choiceNode of mergedChoiceNodes) {
    const choiceChildren: (BlockContent | DefinitionContent)[] = []
    if (choiceNode.children.every((node) => node.type === 'containerDirective')) {
      choiceChildren.push(...choiceNode.children.flatMap((node) => [...node.children]))
    } else {
      choiceChildren.push(...choiceNode.children)
    }
    for (const child of choiceChildren) increaseLvl(child)

    children.push({
      type: 'mdxJsxFlowElement',
      name: 'div',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'data-choice-value', value: choiceNode.choiceValue },
        { type: 'mdxJsxAttribute', name: 'className', value: 'choice' },
      ],
      children: choiceChildren,
    })
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'ChoiceGroup',
    attributes,
    children,
  }
}

function findChoiceGroup(vikeConfig: VikeConfig, choices: string[]) {
  const { choices: choicesConfig } = vikeConfig.config
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

  return choiceGroup
}

function increaseLvl(node: BlockContent | DefinitionContent) {
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ChoiceGroup') {
    const attribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'lvl',
    )
    const lvlValue = attribute?.value
    if (lvlValue) attribute.value = `${Number(lvlValue) + 1}`
  }
}
