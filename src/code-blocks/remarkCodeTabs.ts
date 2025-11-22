// Based on code from: https://github.com/fuma-nama/fumadocs/blob/71b7e2079cdb5fb69009c6812d57355db98b927f/packages/core/src/mdx-plugins/remark-code-tab.ts
export { remarkCodeTabs }

import type { Root, BlockContent } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { CodeTab } from './utils/generateCodeTabs.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeTabs } from './utils/generateCodeTabs.js'

// TODO: refactor to replace CodeTabs with a non-Tabs component
function remarkCodeTabs() {
  return function (tree: Root) {
    visit(tree, 'code', (node) => {
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

        const nodes = node.children.slice(start, end) as BlockContent[]

        const groupFilters = [...new Set(nodes.flat().map((n) => n.data!.group))]

        const groupedNodes = getGroupedNodes(groupFilters, nodes)

        const replacements: MdxJsxFlowElement[] = []

        groupedNodes.map(([, tabs]) => {
          const replacement = generateCodeTabs(tabs, tabs[0].value, persistId)

          replacements.push(replacement)
          replaced.add(replacement)
        })

        node.children.splice(start, end - start, ...replacements)

        end = start
        start = -1
        persistId = undefined
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]
        if (!['containerDirective', 'code'].includes(child.type)) {
          process()
          continue
        }

        if (!child.data?.choice) {
          process()
          continue
        }

        if (child.data?.persistId) persistId = child.data?.persistId
        if (start === -1) start = end
      }

      process()
    })
  }
}

function getGroupedNodes(groupFilters: string[], nodes: BlockContent[]) {
  const groupedNodes = new Map<string, CodeTab[]>()

  groupFilters.map((filter) => {
    const temp = new Map<string, BlockContent[]>()
    nodes
      .filter((node) => node.data!.group === filter)
      .map((node) => {
        const choice = node.data!.choice
        const codes = temp.get(choice) ?? []
        codes.push(node)
        temp.set(choice, codes)
      })

    const groupedByChoice = [...temp].map(([name, codes]) => ({ value: name, children: codes }))

    groupedNodes.set(filter, groupedByChoice)
  })

  return [...groupedNodes]
}

declare module 'mdast' {
  export interface Data {
    group: string
    choice: string
    persistId?: string
  }
}
