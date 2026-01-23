export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import convert from 'npm-to-yarn'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroup } from './utils/generateChoiceGroup.js'

const PKG_MANAGERS = ['pnpm', 'Bun', 'Yarn'] as const

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

      node.value = node.value.replaceAll('npm i ', 'npm install ')
      nodes.set('npm', node)

      for (const pm of PKG_MANAGERS) {
        nodes.set(pm, {
          type: node.type,
          lang: node.lang,
          meta: node.meta,
          value: convert(node.value, pm.toLowerCase() as 'pnpm' | 'bun' | 'yarn'),
        })
      }

      const choiceNodes = [...nodes].map(([name, node]) => ({ choiceValue: name, children: [node] }))
      const replacement = generateChoiceGroup(choiceNodes)

      replacement.data ??= { choice, filter: replacement.type }
      parent.children.splice(index, 1, replacement)
    })
  }
}
