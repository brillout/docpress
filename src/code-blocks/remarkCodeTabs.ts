// Based on code from: https://github.com/fuma-nama/fumadocs/blob/71b7e2079cdb5fb69009c6812d57355db98b927f/packages/core/src/mdx-plugins/remark-code-tab.ts
export { remarkCodeTabs }

import type { Root, Code } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { CodeTab } from './utils/generateCodeTabs.js'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeTabs } from './utils/generateCodeTabs.js'

// TODO: refactor to replace CodeTabs with a non-Tabs component
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

        const code_lang = [...new Set(nodes.flat().map((n) => n.lang!))]

        const groupedNode = getGroupedNode(code_lang, nodes)

        const replacements: MdxJsxFlowElement[] = []

        groupedNode.map(([, tabs]) => {
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

        child.lang = !child.lang ? 'sh' : child.lang.replace('shell', 'sh')
      }

      process()
    })
  }
}

function getGroupedNode(code_lang: string[], nodes: Code[]) {
  const groupedNode = new Map<string, CodeTab[]>()

  code_lang.map((lang) => {
    const temp = new Map<string, Code[]>()
    nodes
      .filter((node) => node.lang === lang)
      .map((node) => {
        const choice = node.data!.choice!
        const codes = temp.get(choice) ?? []
        codes.push(node)
        temp.set(choice, codes)
      })

    const groupedByChoice = [...temp].map(([name, codes]) => ({ value: name, children: codes }))

    groupedNode.set(lang, groupedByChoice)
  })

  return [...groupedNode]
}

declare module 'mdast' {
  export interface CodeData {
    choice?: string
  }
}
