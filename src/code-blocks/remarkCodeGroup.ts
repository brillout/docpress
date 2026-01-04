export { remarkCodeGroup }

import type { Code, Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ContainerDirective } from 'mdast-util-directive'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeGroup } from './utils/generateCodeGroup.js'

type Node = Code | MdxJsxFlowElement | ContainerDirective

function remarkCodeGroup() {
  return function (tree: Root) {
    visit(tree, (node, _i, parent) => {
      if (node.type === 'code') {
        if (parent?.type === 'mdxJsxFlowElement' && parent.name === 'CodeSnippets') return
        if (!node.meta) return

        const meta = parseMetaString(node.meta)
        if (!meta['choice']) return
        node.lang = !node.lang ? 'sh' : node.lang.replace('shell', 'sh')
        node.meta = node.meta.replace(/(choice|persist-id)=([^"'\s]+)/g, '').trim()

        node.data ??= {
          group: node.lang,
          choice: meta['choice'],
          persistId: meta['persist-id'],
        }
      }
      if (node.type === 'containerDirective' && node.name === 'CodeGroup') {
        if (!node.attributes) return
        const choice = node.attributes['choice']
        if (choice) {
          node.data ??= {
            group: 'containerDirective',
            choice,
            persistId: node.attributes['persist-id'] || undefined,
          }
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
      let persistId: string | undefined = undefined

      const process = () => {
        if (start === -1 || start === end) return

        const groupedNodes = groupByNode(node.children.slice(start, end) as Node[])

        if (groupedNodes.every((nodes) => nodes.length <= 1)) return

        const replacements: MdxJsxFlowElement[] = []

        for (const nodes of groupedNodes) {
          const replacement = generateCodeGroup(nodes, nodes[0].value, persistId)

          replacements.push(replacement)
          replaced.add(replacement)
        }

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
        persistId = undefined
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

        if (child.data?.persistId) persistId = child.data.persistId
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

function groupByNode(nodes: Node[]) {
  const groupedNodes = new Set<CodeGroup[]>()
  const groups = [...new Set(nodes.flat().map((n) => n.data?.group || ''))]

  groups.map((group) => {
    const nodesByChoice = new Map<string, Node[]>()
    nodes
      .filter((node) => node.data!.group === group)
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
    persistId?: string
  }
}
