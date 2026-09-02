export { remarkPkgManager }

import type { Code, Root } from 'mdast'
import type { VFile } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { visit } from 'unist-util-visit'
import convert_ from 'npm-to-yarn'
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
      if (!node.value.includes('npm ') && !node.value.includes('npx ')) return
      const nodes = new Map<string, Code>()

      node.value = node.value.replaceAll('npm i ', 'npm install ')
      nodes.set('npm', node)

      for (const pm of PKG_MANAGERS) {
        nodes.set(pm, {
          type: node.type,
          lang: node.lang,
          meta: node.meta,
          value: convertCommands(node.value, pm.toLowerCase() as 'pnpm' | 'bun' | 'yarn'),
        })
      }

      const choiceNodes = [...nodes].map(([name, node]) => ({ choiceValue: name, children: [node] }))
      const replacement = generateChoiceGroupCode(choiceNodes, parent)

      parent.children.splice(index, 1, replacement)
    })
  }
}

// If the string contains `npx`, npm-to-yarn only replaces its first `npx` occurrence and leaves the rest of the string
// untouched (e.g. the `npm install` line of a multi-line command): convert each line separately.
function convertCommands(value: string, pm: 'pnpm' | 'yarn' | 'bun'): string {
  return value
    .split('\n')
    .map((line) => (hasNpmCommand(line) ? convert(line, pm) : line))
    .join('\n')
}
// Whether the line contains an `npm`/`npx` command. (Not a package name such as `skills-npm`, nor a comment like
// `# Make sure you install skills-npm`, which npm-to-yarn would mangle.)
function hasNpmCommand(line: string): boolean {
  return /(^|\s)np[mx](\s|$)/.test(line)
}
