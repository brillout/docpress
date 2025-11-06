// Based on code from: https://github.com/fuma-nama/fumadocs/blob/71b7e2079cdb5fb69009c6812d57355db98b927f/packages/core/src/mdx-plugins/remark-code-tab.ts
export { remarkCodeTabs }

import type { Root, Code } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeTabs } from './utils/generateCodeTabs.js'

function remarkCodeTabs() {
  return function (tree: Root) {
    const replaced = new WeakSet()
    visit(tree, (node) => {
      if (!('children' in node) || replaced.has(node)) return 'skip'

      if (node.type === 'mdxJsxFlowElement') return 'skip'

      let start = -1
      let end = 0
      let persistId: string | undefined = undefined

      const process = () => {
        if (start === -1 || start === end) return

        const nodes = node.children.slice(start, end) as Code[]

        const tabs = Array.from(getTabValue(nodes), ([name, codes]) => ({
          value: name,
          children: codes,
        }))

        const replacement = generateCodeTabs(tabs, tabs[0].value, persistId)

        replaced.add(replacement)

        node.children.splice(start, end - start, replacement)

        end = start
        start = -1
        persistId = undefined
      }

      for (; end < node.children.length; end++) {
        const child = node.children[end]
        if (child.type !== 'code' || !child.meta) {
          process()
          continue
        }

        const meta = parseMetaString(child.meta)
        if (!meta['choice']) {
          process()
          continue
        }
        if (meta['persist-id']) {
          persistId = meta['persist-id']
        }
        if (start === -1) start = end
        child.data ??= {}
        child.data.choice = meta['choice']
      }

      process()
    })
  }
}

function getTabValue(nodes: Code[]) {
  const tabs = new Map<string, Code[]>()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const name = node.data?.choice ?? `Tab ${i + 1}`
    const codes = tabs.get(name) ?? []
    codes.push(node)
    tabs.set(name, codes)
  }
  return tabs
}

declare module 'mdast' {
  export interface CodeData {
    choice?: string
  }
}
