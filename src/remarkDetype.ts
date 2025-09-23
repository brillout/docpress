export { remarkDetype }

import type { Root, Parent, Code } from 'mdast'
import type { VFile } from '@mdx-js/mdx/internal-create-format-aware-processors'
import { visit } from 'unist-util-visit'
import { assertUsage } from './utils/assert.js'
import pc from '@brillout/picocolors'
import module from 'node:module'
// Cannot use `import { transform } from 'detype'` as it results in errors,
// and the package has no default export. Using `module.createRequire` instead.
const { transform: detype } = module.createRequire(import.meta.url)('detype') as typeof import('detype')

const prettierOptions: NonNullable<Parameters<typeof detype>[2]>['prettierOptions'] = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'none',
}

type CodeNode = {
  tsCode: Code
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
      code_nodes.push({ tsCode: node, index, parent })
    })

    for (const node of code_nodes.reverse()) {
      if (node.tsCode.lang === 'yaml') {
        transformYaml(node)
      } else {
        await transformTsToJs(node, file)
      }
    }
  }
}

function transformYaml(node: CodeNode) {
      const { tsCode, index, parent } = node
        // Replace all '.ts' extensions with '.js' in the original `YAML` node value to create a JS version
        const codeBlockContentJs = tsCode.value.replaceAll('.ts', '.js')

        // Skip wrapping if the YAML code block hasn't changed
        if (codeBlockContentJs === tsCode.value) return

        // Create a new code node for the JS version based on the modified YAML
        const yamlJsCode: Code = {
          type: tsCode.type,
          data: tsCode.data,
          meta: tsCode.meta,
          lang: tsCode.lang,
          value: codeBlockContentJs,
        }

        // Wrap both the original YAML and `yamlJsCode` nodes in a `CodeSnippets` container
        const yamlContainer = {
          type: 'mdxJsxFlowElement' as const,
          name: 'CodeSnippets',
          children: [yamlJsCode, tsCode],
          attributes: [],
        }

        // Replace original YAML node with `CodeSnippets` container
        parent.children.splice(index, 1, yamlContainer)
}

async function transformTsToJs(node: CodeNode, file: VFile) {
  const { tsCode, index, parent } = node
  // Replace all '.ts' extensions with '.js' in the original `tsCode` node value to create a JS version
  let codeBlockContentJs = tsCode.value.replaceAll('.ts', '.js')

  // Remove TypeScript from the TS/TSX/Vue code node
  try {
    codeBlockContentJs = await detype(codeBlockContentJs, `some-dummy-filename.${tsCode.lang}`, {
      customizeBabelConfig(config) {
        // Add `onlyRemoveTypeImports: true` to the internal `@babel/preset-typescript` config
        // See https://github.com/cyco130/detype/blob/main/src/transform.ts#L206
        assertUsage(config.presets && config.presets.length === 1, 'Unexpected Babel config presets')
        config.presets = [[config.presets[0], { onlyRemoveTypeImports: true }]]
      },
      removeTsComments: true,
      prettierOptions,
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
        '- Use custom magic comments (see: https://github.com/brillout/docpress/?tab=readme-ov-file#detype-custom-magic-comments)',
      ].join('\n') + '\n',
    )
    return
  }

  // Clean up both JS and TS code contents: correct diff comments (for js only) and apply custom magic comment replacements
  codeBlockContentJs = cleanUpCode(codeBlockContentJs.trimEnd(), true)
  tsCode.value = cleanUpCode(tsCode.value)

  // No wrapping needed if JS and TS code are still identical
  if (codeBlockContentJs === tsCode.value) return

  const jsCode: Code = {
    type: tsCode.type,
    data: tsCode.data,
    meta: tsCode.meta,
    // The jsCode lang should be js|jsx|vue
    lang: tsCode.lang!.replace('t', 'j'),
    value: codeBlockContentJs,
  }

  // Wrap both the original `tsCode` and `jsCode` nodes in a `CodeSnippets` container
  const container = {
    type: 'mdxJsxFlowElement' as const,
    name: 'CodeSnippets',
    children: [jsCode, tsCode],
    attributes: [],
  }
  // Replace the original `tsCode` node with the `CodeSnippets` container
  parent.children.splice(index, 1, container)
}

function cleanUpCode(code: string, isJsCode: boolean = false) {
  if (isJsCode) {
    code = correctCodeDiffComments(code)
  }
  return processMagicComments(code)
}
function processMagicComments(code: string) {
  // @detype-rename DummyLayout Layout
  const renameCommentRE = /^\/\/\s@detype-rename\s([^ ]+) ([^ ]+)\n/gm
  const matches = Array.from(code.matchAll(renameCommentRE))

  if (matches.length) {
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      const [fullMatch, renameFrom, renameTo] = match
      code = code.split(fullMatch).join('').replaceAll(renameFrom, renameTo)
    }
  }
  code = code.replaceAll('//~', '')

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
