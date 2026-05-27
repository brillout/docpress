export { remarkChoiceGroup }
export type { ChoiceGroup, ChoiceGroupWithParent }

import type { Root } from 'mdast'
import type { Plugin, Transformer } from 'unified'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { Config } from '../types/Config.js'
import type { ChoiceNode } from './utils/generateChoiceGroupCode.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode, expressionToAttribute } from './utils/generateChoiceGroupCode.js'
import { remarkPkgManager } from './remarkPkgManager.js'
import { remarkDetype } from './remarkDetype.js'

const remarkChoiceGroup: Plugin<[], Root> = (): Transformer<Root> => {
  return async (tree, file) => {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['choice'])
        const { choice } = meta.props
        node.meta = meta.rest

        if (choice) {
          const filter = ['jsx', 'tsx', 'vue'].includes(node.lang ?? '') ? 'code-component' : `code-${node.lang}`
          node.data ??= { customDataChoice: choice, customDataFilter: filter }
        }
      }
      if (node.type === 'containerDirective' && node.name === 'Choice') {
        if (!node.attributes) return
        const { id: choice } = node.attributes
        if (choice) {
          node.data ??= { customDataChoice: choice, customDataFilter: node.type }
          node.attributes = {}
        }
      }
    })

    visit(tree, (node) => {
      if (!('children' in node) || node.data?.customDataIsVisited) return 'skip'

      let start = -1
      let end = 0

      const process = () => {
        if (start === -1 || start === end) return
        const nodes = node.children.slice(start, end) as ChoiceNode['children']
        const choiceNodesFiltered = filterChoices(nodes)
        const replacements: MdxJsxFlowElement[] = []

        for (const choiceNodes of choiceNodesFiltered) {
          const replacement = generateChoiceGroupCode(choiceNodes, node)
          replacement.data ??= {}
          replacement.data.customDataIsVisited = true
          replacements.push(replacement)
        }

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]!

        if (!['code', 'containerDirective'].includes(child.type)) {
          process()
          continue
        }

        if (!child.data?.customDataChoice) {
          process()
          continue
        }

        if (start === -1) start = end
      }

      process()
    })

    await remarkDetype.call(this)(tree, file)
    remarkPkgManager.call(this)(tree, file)

    visit(tree, 'mdxJsxFlowElement', (node) => {
      if (node.name !== 'CustomSelectsContainer') return 'skip'

      const choiceGroupAll: ChoiceGroupWithParent[] = []

      visit(node, 'mdxJsxFlowElement', (child) => {
        if (child.name !== 'ChoiceGroup') return

        const choiceGroup = child.data?.customDataChoiceGroup
        const parentChoiceGroup = child.data?.customDataParentChoiceGroup

        if (!choiceGroup) return

        const existing = choiceGroupAll.find((g) => g.name === choiceGroup.name)

        // first occurrence
        if (!existing) {
          choiceGroupAll.push({
            ...choiceGroup,
            ...(parentChoiceGroup && {
              parentChoiceGroup: {
                name: parentChoiceGroup.name,
                default: parentChoiceGroup.default,
                choices: !choiceGroup.hidden ? [parentChoiceGroup.choice] : [],
              },
            }),
          })

          return
        }

        // merge parent choices
        if (parentChoiceGroup && existing.parentChoiceGroup && !choiceGroup.hidden) {
          existing.parentChoiceGroup.choices = [
            ...new Set([...existing.parentChoiceGroup.choices, parentChoiceGroup.choice]),
          ]
        }
      })

      node.attributes.push(expressionToAttribute('choiceGroupAll', choiceGroupAll))

      return 'skip'
    })
  }
}

function filterChoices(nodes: ChoiceNode['children']) {
  const filteredChoices = new Set<ChoiceNode[]>()
  const filters = [...new Set(nodes.flat().map((node) => node.data!.customDataFilter!))]

  filters.map((filter) => {
    const nodesByChoice = new Map<string, ChoiceNode['children']>()
    nodes
      .filter((node) => node.data!.customDataFilter! === filter)
      .map((node) => {
        const choice = node.data!.customDataChoice!
        const nodes = nodesByChoice.get(choice) ?? []
        nodes.push(node)
        nodesByChoice.set(choice, nodes)
      })

    const choiceNodes = [...nodesByChoice].map(([name, nodes]) => ({ choiceValue: name, children: nodes }))
    filteredChoices.add(choiceNodes)
  })

  return [...filteredChoices]
}

type ChoiceGroup = NonNullable<Config['choices']>[string] & {
  name: string
  emptyChoices: string[]
  hidden: boolean
  lvl: number
}
type ParentChoiceGroup = { name: string; default: string }
type ChoiceGroupWithParent = ChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }

declare module 'mdast' {
  export interface Data {
    customDataIsVisited?: boolean
    customDataChoice?: string
    customDataFilter?: string
    customDataChoiceGroup?: ChoiceGroup
    customDataParentChoiceGroup?: ParentChoiceGroup & {
      choice: string
      lvl: number
    }
  }
}
