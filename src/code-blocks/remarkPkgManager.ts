export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import convert from 'npm-to-yarn'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateCodeGroup } from './utils/generateCodeGroup.js'

const PKG_MANAGERS = ['pnpm', 'yarn', 'bun'] as const

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

        for (const pm of PKG_MANAGERS) {
          nodes.set(pm, {
            type: node.type,
            lang: node.lang,
            value: convert(node.value, pm),
          })
        }

        const groupedNodes = [...nodes].map(([name, node]) => ({ value: name, children: [node] }))

        const replacement = generateCodeGroup(groupedNodes, 'npm', 'pkg-manager')

        if (choice) {
          replacement.data ??= {
            group: 'pkg-managers',
            choice,
            persistId,
          }
        }
        parent.children.splice(index, 1, replacement)
      }
    })
  }
}
