export { generateChoiceGroupCode, expressionToAttribute }
export type { ChoiceNode }

import type { Config } from '../../types/Config.js'
import type { ChoiceGroup } from '../types.js'
import type { BlockContent, DefinitionContent, Parent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxFlowElementData } from 'mdast-util-mdx-jsx'
import { getVikeConfig } from 'vike/plugin'
import { assertUsage } from '../../utils/assert.js'
import { valueToEstree } from 'estree-util-value-to-estree'
import { resolveChoices } from './resolveChoices.js'
import { JAVASCRIPT_ICON, TYPESCRIPT_ICON, NPM_ICON, PNPM_ICON, BUN_ICON, YARN_ICON } from './constant.js'

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
        icon: JAVASCRIPT_ICON,
        iconStyle: { marginBottom: '0.5px', height: '11.5px' },
      },
      {
        name: 'TypeScript',
        icon: TYPESCRIPT_ICON,
        iconStyle: { marginBottom: '0.5px', height: '11.5px' },
      },
    ],
    default: 'JavaScript',
    hoverVisibility: true,
  },
  pkgManager: {
    choices: [
      { name: 'npm', icon: NPM_ICON },
      { name: 'pnpm', icon: PNPM_ICON },
      {
        name: 'Bun',
        icon: BUN_ICON,
        iconStyle: { marginBottom: '1px' },
        iconStyleDropdown: { height: '11px' },
      },
      { name: 'Yarn', icon: YARN_ICON, iconStyle: { height: '12px' } },
    ],
    default: 'npm',
    hoverVisibility: false,
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
    /*
    // Keep the marker on the parent: a single choice can contain several toggleable code blocks
    // (e.g. two TypeScript blocks, or a TypeScript block + an `npm` command). Each of them spawns
    // its own nested choice group and must inherit the same parent level. Clearing the marker here
    // would make every group after the first resolve to `lvl: 0`, wrapping it in its own
    // `CustomSelectsContainer` — which then renders without `choiceGroupAll` and crashes.
    parent.data = undefined
    */
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
            emptyChoices: choiceGroup.emptyChoices,
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
      name: 'ChoiceGroupContainer',
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
  const choicesAll = resolveChoices({ ...CHOICES_BUILT_IN, ...choicesConfig })

  // Resolve to the group that defines ALL of the block's values. Matching a group that merely
  // shares ANY value would mis-resolve a custom group that collides with a built-in on a single
  // value — e.g. a `runtime` group [Node, Bun, Deno, Cloudflare] sharing `Bun` with `pkgManager`.
  const groupName = Object.keys(choicesAll).find((key) =>
    choices.every((choice) => choicesAll[key]!.choices.some(({ name }) => name === choice)),
  )
  assertUsage(groupName, `Missing group name for [${choices}]. Define it in +docpress.choices.`)

  const group = choicesAll[groupName]!
  const emptyChoices = group.choices.filter((choice) => !choices.includes(choice.name)).map((choice) => choice.name)

  const choiceGroup = {
    name: groupName,
    ...group,
    emptyChoices,
    hoverVisibility: group.hoverVisibility !== false,
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
