export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import convert_ from 'npm-to-yarn'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode } from './utils/generateChoiceGroupCode.js'
// @ts-expect-error The type of npm-to-yarn doesn't work with `"moduleResolution": "Node16"`
const convert: (str: string, to: 'npm' | 'yarn' | 'pnpm' | 'bun') => string = convert_

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
      const replacement = generateChoiceGroupCode(choiceNodes)

      replacement.data ??= { customDataChoice: choice, customDataFilter: replacement.type }
      parent.children.splice(index, 1, replacement)
    })
  }
}
