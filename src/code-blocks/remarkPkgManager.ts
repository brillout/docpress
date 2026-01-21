export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import convert from 'npm-to-yarn'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroup } from './utils/generateChoiceGroup.js'

const PKG_MANAGERS = ['pnpm', 'yarn', 'bun'] as const

function remarkPkgManager() {
  return function (tree: Root) {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index === 'undefined') return
      if (!['sh', 'shell'].includes(node.lang || '')) return
      if (node.value.indexOf('npm') === -1 && node.value.indexOf('npx') === -1) return

      let choice: string | undefined = undefined
      const nodes = new Map<string, Code>()

      if (node.meta) {
        const meta = parseMetaString(node.meta, ['choice'])
        choice = meta.props['choice']
        node.meta = meta.rest
      }

      nodes.set('npm', node)

      for (const pm of PKG_MANAGERS) {
        nodes.set(pm, {
          type: node.type,
          lang: node.lang,
          meta: node.meta,
          value: convert(node.value, pm),
        })
      }

      const groupedNodes = [...nodes].map(([name, node]) => ({ value: name, children: [node] }))
      const replacement = generateChoiceGroup(groupedNodes)

      replacement.data ??= { choice, filter: [node.type, node.lang].join('-') }
      parent.children.splice(index, 1, replacement)
    })
  }
}
