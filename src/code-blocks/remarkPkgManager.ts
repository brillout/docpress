export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import type { VFile } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { visit } from 'unist-util-visit'
import convert_ from 'npm-to-yarn'
import { parseMetaString } from './rehypeMetaToProps.js'
import { generateChoiceGroupCode } from './utils/generateChoiceGroupCode.js'
import { assertUsage } from '../utils/assert.js'
import pc from '@brillout/picocolors'
// @ts-expect-error The type of npm-to-yarn doesn't work with `"moduleResolution": "Node16"`
const convert: (str: string, to: 'npm' | 'yarn' | 'pnpm' | 'bun') => string = convert_

const PKG_MANAGERS = ['pnpm', 'Bun', 'Yarn'] as const

function remarkPkgManager() {
  return function (tree: Root, file: VFile) {
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index === 'undefined') return
      if (!['bash', 'sh', 'shell'].includes(node.lang || '')) return
      assertUsage(
        !node.value.includes('pnpm'),
        `Found a 'pnpm' command in the code block at: ${pc.bold(pc.blue(file.path))}, line ${
          node.position?.start.line
        }. Replace it with the equivalent 'npm' command for the package manager toggle to work.`,
      )
      if (node.value.includes('npm ') && node.value.includes('npx ')) return
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
