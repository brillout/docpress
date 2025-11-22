export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import convert from 'npm-to-yarn'
import { generateCodeTabs } from './utils/generateCodeTabs.js'
import { parseMetaString } from './rehypeMetaToProps.js'

const PKG_MANAGERS = ['yarn', 'pnpm', 'bun'] as const

function remarkPkgManager() {
  return function (tree: Root) {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index === 'undefined') return
      if (!['sh', 'shell'].includes(node.lang || '')) return
      if (node.value.indexOf('npm') !== -1 || node.value.indexOf('npx') !== -1) {
        let choice: string | undefined = undefined
        let persistId: string | undefined = undefined

        if (node.meta) {
          const metaProps = parseMetaString(node.meta)
          choice = metaProps['choice']
          persistId = metaProps['persist-id']
          node.meta = node.meta.replace(/(choice|persist-id)=([^"'\s]+)/g, '').trim()
        }

        const nodes = new Map<string, Code>()
        nodes.set('npm', node)

        PKG_MANAGERS.map((pm) => {
          const newNode: Code = {
            type: node.type,
            lang: node.lang,
            value: convert(node.value, pm),
          }
          nodes.set(pm, newNode)
        })

        const groupedNodes = [...nodes].map(([name, code]) => ({ value: name, children: [code] }))

        const replacement = generateCodeTabs(groupedNodes, 'npm', 'pkg-manager')
        parent.children.splice(index, 1, replacement)
      }
    })
  }
}
