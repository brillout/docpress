export { remarkDetype }

import type { Root, Parent, Code } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { VFile } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { visit } from 'unist-util-visit'
import { assertUsage } from '../utils/assert.js'
import { parseMetaString } from './rehypeMetaToProps.js'
import pc from '@brillout/picocolors'
import module from 'node:module'
// Cannot use `import { transform } from 'detype'` as it results in errors,
// and the package has no default export. Using `module.createRequire` instead.
const { transform: detype } = module.createRequire(import.meta.url)('detype') as typeof import('detype')

const prettierOptions: NonNullable<Parameters<typeof detype>[2]>['prettierOptions'] = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
}

type CodeNode = {
  codeBlock: Code
  index: number
  parent: Parent
}

function remarkDetype() {
  return async function transformer(tree: Root, file: VFile) {
    const code_nodes: CodeNode[] = []

    visit(tree, 'code', (node, index, parent) => {
      if (!parent || typeof index === 'undefined') return
      // Skip if `node.lang` is not ts, tsx, vue, or yaml
      if (!['ts', 'tsx', 'vue', 'yaml'].includes(node.lang || '')) return

      // Skip if 'ts-only' meta is present
      if (node.meta?.includes('ts-only')) return

      // Collect this node for post-processing
      code_nodes.push({ codeBlock: node, index, parent })
    })

    for (const node of code_nodes.reverse()) {
      if (node.codeBlock.lang === 'yaml') {
        transformYaml(node)
      } else {
        await transformTsToJs(node, file)
      }
    }
  }
}

function transformYaml(node: CodeNode) {
  const { codeBlock, index, parent } = node
  const codeBlockContentJs = replaceFileNameSuffixes(codeBlock.value)

  // Skip wrapping if the YAML code block hasn't changed
  if (codeBlockContentJs === codeBlock.value) return

  const { position, ...rest } = codeBlock

  // Create a new code node for the JS version based on the modified YAML
  const yamlJsCode: Code = {
    ...rest,
    value: codeBlockContentJs,
  }

  // Wrap both the original YAML and `yamlJsCode` with <CodeSnippets>
  const yamlContainer: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'CodeSnippets',
    children: [yamlJsCode, codeBlock],
    attributes: [
      {
        name: 'hideToggle',
        type: 'mdxJsxAttribute',
      },
    ],
  }
  parent.children.splice(index, 1, yamlContainer)
}

async function transformTsToJs(node: CodeNode, file: VFile) {
  const { codeBlock, index, parent } = node
  const maxWidth = Number(parseMetaString(codeBlock.meta)['max-width'])
  let codeBlockReplacedJs = replaceFileNameSuffixes(codeBlock.value)
  let codeBlockContentJs = ''

  // Remove TypeScript from the TS/TSX/Vue code node
  try {
    codeBlockContentJs = await detype(codeBlockReplacedJs, `some-dummy-filename.${codeBlock.lang}`, {
      customizeBabelConfig(config) {
        // Add `onlyRemoveTypeImports: true` to the internal `@babel/preset-typescript` config
        // https://github.com/cyco130/detype/blob/46ec867e9efd31d31a312a215ca169bd6bff4726/src/transform.ts#L206
        assertUsage(config.presets && config.presets.length === 1, 'Unexpected Babel config presets')
        config.presets = [[config.presets[0], { onlyRemoveTypeImports: true }]]
      },
      removeTsComments: true,
      prettierOptions: {
        ...prettierOptions,
        printWidth: maxWidth ? maxWidth : 99,
      },
    })
  } catch (error) {
    // Log errors and return original content instead of throwing
    console.error(pc.red((error as SyntaxError).message))
    console.error(
      [
        `Failed to transform the code block in: ${pc.bold(pc.blue(file.path))}.`,
        "This likely happened due to invalid TypeScript syntax (see detype's error message above). You can either:",
        '- Fix the code block syntax',
        '- Set the code block language to js instead of ts',
        '- Use custom meta or comments https://github.com/brillout/docpress#detype',
      ].join('\n') + '\n',
    )
    return
  }

  // Clean up both JS and TS code contents: correct diff comments (for js only) and apply custom magic comment replacements
  codeBlockContentJs = cleanUpCode(codeBlockContentJs.trimEnd(), true)
  codeBlock.value = cleanUpCode(codeBlock.value)

  // No wrapping needed if JS and TS code are still identical
  if (codeBlockContentJs === codeBlock.value) return

  const { position, lang, ...rest } = codeBlock
  const attributes: MdxJsxFlowElement['attributes'] = []

  const jsCode: Code = {
    ...rest,
    // The jsCode lang should be js|jsx|vue
    lang: lang!.replace('t', 'j'),
    value: codeBlockContentJs,
  }

  // Add `hideToggle` attribute (prop) to `CodeSnippets` if the only change was replacing `.ts` with `.js`
  if (codeBlockReplacedJs === codeBlockContentJs) {
    attributes.push({
      name: 'hideToggle',
      type: 'mdxJsxAttribute',
    })
  }

  // Wrap both the original `codeBlock` and `jsCode` with <CodeSnippets>
  const container: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'CodeSnippets',
    children: [jsCode, codeBlock],
    attributes,
  }
  parent.children.splice(index, 1, container)
}

// Replace all '.ts' extensions with '.js'
function replaceFileNameSuffixes(codeBlockValue: string) {
  return codeBlockValue.replaceAll('.ts', '.js')
}

function cleanUpCode(code: string, isJsCode: boolean = false) {
  if (isJsCode) {
    code = correctCodeDiffComments(code)
  }
  return processMagicComments(code)
}
function processMagicComments(code: string) {
  // @detype-replace DummyLayout Layout
  const renameCommentRE = /^\s*\/\/\s@detype-replace\s([^ ]+) ([^ ]+)\n/gm
  const matches = Array.from(code.matchAll(renameCommentRE))

  if (matches.length) {
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      const [fullMatch, renameFrom, renameTo] = match
      code = code.split(fullMatch).join('').replaceAll(renameFrom, renameTo)
    }
  }
  code = code.replaceAll('// @detype-uncomment ', '')

  return code
}
/**
 * Correct code diff comments that detype() unexpectedly reformatted (using Prettier and Babel internally)
 * after removing TypeScript.
 * See https://github.com/brillout/docpress/pull/47#issuecomment-3263953899
 * @param code Transformed Javascript code.
 * @returns The corrected code.
 */
function correctCodeDiffComments(code: string) {
  // Expected to match the code diff comments: `// [!code ++]` and `// [!code --]` started with newline and optional spaces
  const codeDiffRE = /\n\s*\/\/\s\[!code.+\]/g
  return code.replaceAll(codeDiffRE, (codeDiff) => codeDiff.trimStart())
}
