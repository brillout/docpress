export { remarkChoiceGroup }

import type { Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ChoiceNode } from './utils/generateChoiceGroupCode.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode } from './utils/generateChoiceGroupCode.js'

function remarkChoiceGroup() {
  return function (tree: Root) {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['choice'])
        const { choice } = meta.props
        node.meta = meta.rest

        if (choice) node.data ??= { customDataChoice: choice, customDataFilter: `code-${node.lang}` }
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

    const replaced = new WeakSet()
    visit(tree, (node) => {
      if (!('children' in node) || replaced.has(node)) return 'skip'
      if (node.type === 'mdxJsxFlowElement') return 'skip'

      let start = -1
      let end = 0

      const process = () => {
        if (start === -1 || start === end) return
        const nodes = node.children.slice(start, end) as ChoiceNode['children']
        const choiceNodesFiltered = filterChoices(nodes)
        const replacements: MdxJsxFlowElement[] = []

        for (const choiceNodes of choiceNodesFiltered) {
          const replacement = generateChoiceGroupCode(choiceNodes)

          replacements.push(replacement)
          replaced.add(replacement)
        }

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
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
  }
}
