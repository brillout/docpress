export { generateChoiceGroupCode, expressionToAttribute, resolveChoiceGroupName, CHOICES_BUILT_IN }
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
        icon: 'https://www.svgrepo.com/show/452045/js.svg',
        iconStyle: { position: 'relative', top: -0.5 },
      },
      {
        name: 'TypeScript',
        icon: 'https://www.svgrepo.com/show/349540/typescript.svg',
        iconStyle: { position: 'relative', top: -0.5 },
      },
    ],
    default: 'JavaScript',
  },
  pkgManager: {
    choices: [
      {
        name: 'npm',
        icon: 'https://www.svgrepo.com/show/452077/npm.svg',
        iconStyle: { position: 'relative', top: 1.5 },
      },
      { name: 'pnpm', icon: 'https://www.svgrepo.com/show/373778/light-pnpm.svg' },
      { name: 'Bun', icon: 'https://bun.com/logo.svg' },
      {
        name: 'Yarn',
        icon: 'https://www.svgrepo.com/show/354588/yarn.svg',
        iconStyle: { position: 'relative', top: -0.5 },
      },
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

  const groupName = resolveChoiceGroupName(choices, choicesAll)
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

// Resolve which choice group a block belongs to, given the set of choice values the block is
// tagged with. Pick the BEST match: prefer a group that provides ALL of the block's values
// (complete match), then the group with the largest overlap. Resolving to the first group that
// merely shares ANY value would mis-resolve a custom group that collides with a built-in on a
// single value — e.g. a `runtime` group [Node, Bun, Deno, Cloudflare] sharing `Bun` with the
// built-in `pkgManager` [npm, pnpm, Bun, Yarn] would wrongly resolve to `pkgManager`.
function resolveChoiceGroupName(choices: string[], choicesAll: NonNullable<Config['choices']>): string | undefined {
  return Object.keys(choicesAll)
    .map((key) => {
      const groupChoices = choicesAll[key]!.choices.map((choice) => choice.name)
      return {
        key,
        // number of the block's values that this group provides
        overlap: groupChoices.filter((name) => choices.includes(name)).length,
        // whether this group provides ALL of the block's values
        complete: choices.every((choice) => groupChoices.includes(choice)),
      }
    })
    .filter((group) => group.overlap > 0)
    .sort((a, b) => Number(b.complete) - Number(a.complete) || b.overlap - a.overlap)[0]?.key
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
