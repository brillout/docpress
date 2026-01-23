export { remarkChoiceGroup }

import type { Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { NodeChoice } from './utils/generateChoiceGroup.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroup } from './utils/generateChoiceGroup.js'

function remarkChoiceGroup() {
  return function (tree: Root) {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['choice'])
        const { choice } = meta.props
        node.meta = meta.rest

        if (choice) node.data ??= { choice, filter: [node.type, node.lang].join('-') }
      }
      if (node.type === 'containerDirective' && node.name === 'Choice') {
        if (!node.attributes) return
        const { id: choice } = node.attributes
        if (choice) {
          node.data ??= { choice, filter: node.type }
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
        const nodes = node.children.slice(start, end) as NodeChoice['children']
        const filteredChoices = filterChoices(nodes)
        const replacements: MdxJsxFlowElement[] = []

        for (const choices of filteredChoices) {
          const replacement = generateChoiceGroup(choices)

          replacements.push(replacement)
          replaced.add(replacement)
        }

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]

        if (!['code', 'mdxJsxFlowElement', 'containerDirective'].includes(child.type)) {
          process()
          continue
        }

        if (!child.data?.choice) {
          process()
          continue
        }

        if (start === -1) start = end
      }

      process()
    })
  }
}

function filterChoices(nodes: NodeChoice['children']) {
  const filteredChoices = new Set<NodeChoice[]>()
  const filters = [...new Set(nodes.flat().map((node) => node.data!.filter!))]

  filters.map((filter) => {
    const nodesByChoice = new Map<string, NodeChoice['children']>()
    nodes
      .filter((node) => node.data!.filter! === filter)
      .map((node) => {
        const choice = node.data!.choice!
        const nodes = nodesByChoice.get(choice) ?? []
        node.data = {}
        nodes.push(node)
        nodesByChoice.set(choice, nodes)
      })

    filteredChoices.add([...nodesByChoice].map(([name, nodes]) => ({ value: name, children: nodes })))
  })

  return [...filteredChoices]
}

declare module 'mdast' {
  export interface Data {
    choice?: string
    filter?: string
  }
}
