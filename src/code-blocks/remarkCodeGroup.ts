export { remarkCodeGroup }

import type { Code, Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ContainerDirective } from 'mdast-util-directive'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeGroup } from './utils/generateCodeGroup.js'
import { assertUsage } from '../utils/assert.js'

type Node = Code | MdxJsxFlowElement | ContainerDirective

function remarkCodeGroup() {
  return function (tree: Root) {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (!node.meta) return
        const meta = parseMetaString(node.meta, ['group', 'choice'])
        const { choice, group } = meta.props
        node.meta = meta.rest

        if (choice) node.data ??= { choice, group }
      }
      if (node.type === 'containerDirective' && node.name === 'CodeGroup') {
        if (!node.attributes) return
        const { id: choice, group } = node.attributes
        if (choice) {
          node.data ??= { choice, group: group || undefined }
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
        const nodes = node.children.slice(start, end) as Node[]
        const groupName = nodes.filter((node) => node.data?.group !== undefined)[0]?.data?.group
        assertUsage(groupName, 'no group name is provided, did you forget to add `group=group-name` meta/attribute ?')

        const groupedNodes = groupByNodeType(nodes)

        if (groupedNodes.every((nodes) => nodes.length <= 1)) return

        const replacements: MdxJsxFlowElement[] = []

        for (const groupedNode of groupedNodes) {
          const replacement = generateCodeGroup(groupName, groupedNode)

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

type CodeGroup = {
  value: string
  children: Node[]
}

function groupByNodeType(nodes: Node[]) {
  const groupedNodes = new Set<CodeGroup[]>()
  const filters = [...new Set(nodes.flat().map((node) => (node.type === 'code' ? node.lang! : node.name)))]

  filters.map((filter) => {
    const nodesByChoice = new Map<string, Node[]>()
    nodes
      .filter((node) => (node.type === 'code' ? node.lang! : node.name) === filter)
      .map((node) => {
        const choice = node.data!.choice!
        const nodes = nodesByChoice.get(choice) ?? []
        nodes.push(node)
        node.data = {}
        nodesByChoice.set(choice, nodes)
      })

    groupedNodes.add([...nodesByChoice].map(([name, nodes]) => ({ value: name, children: nodes })))
  })

  return [...groupedNodes]
}

declare module 'mdast' {
  export interface Data {
    group?: string
    choice?: string
  }
}
