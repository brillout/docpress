export { remarkChoiceGroup }

import type { Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ChoiceNode } from './utils/generateChoiceGroupCode.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode, generateTabs } from './utils/generateChoiceGroupCode.js'

function remarkChoiceGroup() {
  return function (tree: Root) {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['choice', 'dropdown'])
        const { choice, dropdown } = meta.props
        node.meta = meta.rest

        if (choice)
          node.data ??= {
            customDataChoice: choice,
            customDataFilter: `code-${node.lang}`,
            customDataIsDropdown: !!dropdown,
          }
      }
      if (node.type === 'containerDirective' && node.name === 'Choice') {
        if (!node.attributes) return
        const { id: choice } = node.attributes
        if (choice) {
          node.data ??= { customDataChoice: choice, customDataFilter: choice, customDataIsDropdown: false }
          node.attributes = {}
        }
      }
    })

    const replaced = new WeakSet()
    visit(tree, (node) => {
      if (!('children' in node) || replaced.has(node)) return 'skip'

      let start = -1
      let end = 0
      let isDropDown = false

      const process = () => {
        if (start === -1 || start === end) return
        const nodes = node.children.slice(start, end) as ChoiceNode['children']
        const choiceNodesFiltered = filterChoices(nodes)
        const replacements: MdxJsxFlowElement[] = []

        if (isDropDown) {
          for (const choiceNodes of choiceNodesFiltered) {
            const replacement = generateChoiceGroupCode(choiceNodes, node)
            replacements.push(replacement)
          }
        } else {
          const replacement = generateTabs(choiceNodesFiltered.flat())
          replacements.push(replacement)
        }
        replaced.add(replacements)

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
        isDropDown = false
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]!

        if (!['code', 'mdxJsxFlowElement', 'containerDirective'].includes(child.type)) {
          process()
          continue
        }

        if (!child.data?.customDataChoice) {
          process()
          continue
        }

        if (child.data.customDataIsDropdown) isDropDown = true
        if (!isDropDown) child.data.customDataFilter = child.data.customDataChoice

        if (start === -1) start = end
      }

      process()
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
        node.data!.customDataChoice = undefined
        nodes.push(node)
        nodesByChoice.set(choice, nodes)
      })

    const choiceNodes = [...nodesByChoice].map(([name, nodes]) => ({ choiceValue: name, children: nodes }))
    filteredChoices.add(choiceNodes)
  })

  return [...filteredChoices]
}

declare module 'mdast' {
  export interface Data {
    customDataChoice?: string
    customDataFilter?: string
    customDataIsDropdown?: boolean
    customDataParentChoiceGroup?: {
      name: string
      choice: string
      default: string
      lvl: number
    }
  }
}
