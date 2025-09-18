export { detypePlugin }

import type { PluginOption } from 'vite'
import module from 'node:module'
import { assertUsage } from './utils/assert.js'
import pc from '@brillout/picocolors'
import { getMagicString } from './utils/getMagicString.js'
// Cannot use `import { transform } from 'detype'` as it results in errors,
// and the package has no default export. Using `module.createRequire` instead.
const { transform: detype } = module.createRequire(import.meta.url)('detype') as typeof import('detype')

const prettierOptions: NonNullable<Parameters<typeof detype>[2]>['prettierOptions'] = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'none',
}
// RegExp to find TypeScript code blocks.
//
// For example:
// ~~~mdx
// ```ts
// const hello: string = 'world'
// ```
// ~~~
//
// But also indented code blocks:
// ~~~mdx
// > Also works:
// > - In blockquotes
// > - In bullet points
// >   ```ts
// >   const hello: string = 'world'
// >   ```
// ~~~
const codeBlockRE = /^(.*)```(tsx?|vue|yaml)[^\n]*\n([\s\S]*?)```/gm

function detypePlugin(): PluginOption {
  return {
    name: '@brillout/docpress:detypePlugin',
    enforce: 'pre',
    transform: async (code: string, moduleId: string) => {
      if (!moduleId.endsWith('.mdx')) return
      return await transformCode(code, moduleId)
    },
  }
}

async function transformCode(code: string, moduleId: string) {
  const matches = Array.from(code.matchAll(codeBlockRE))
  if (matches.length === 0) return

  const { magicString, getMagicStringResult } = getMagicString(code, moduleId)

  magicString.prepend(`import { CodeSnippets } from '@brillout/docpress';\n\n`)

  // [Claude AI] Process matches in reverse order to avoid offset issues
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const [codeBlockOuterStr, codeBlockIndent, codeBlockLang, codeBlockContentWithIndent] = match
    const isYaml = codeBlockLang === 'yaml'

    // Remove indentation
    const codeBlockOpen = codeBlockOuterStr.split('\n')[0].slice(codeBlockIndent.length)
    const codeBlockContent = removeCodeBlockIndent(codeBlockContentWithIndent, codeBlockIndent, moduleId)

    if (codeBlockOpen.includes('ts-only')) continue

    let replacement: string

    // TODO: wrap with new component `<InlineCode>`
    // if (codeBlockOpen.includes('inline')) {
    //   // replacement = `<InlineCode>${codeBlockOuterStr}</InlineCode>`
    //   // continue
    // }

    let codeBlockContentJs = codeBlockContent.replaceAll('.ts', '.js')
    const codeBlockClose = '```'

    if (isYaml) {
      if (codeBlockContentJs === codeBlockContent) continue
      const codeBlockYamlJs = `${codeBlockOpen}\n${codeBlockContentJs}${codeBlockClose}`
      const codeBlockYamlTs = `${codeBlockOpen}\n${codeBlockContent}${codeBlockClose}`

      replacement = wrapCodeSnippets(codeBlockYamlJs, codeBlockYamlTs, codeBlockIndent)
    } else {
      // Remove TypeScript
      try {
        codeBlockContentJs = await detype(codeBlockContentJs, `some-dummy-filename.${codeBlockLang}`, {
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
        console.error(pc.red((error as SyntaxError).message))
        console.error(
          [
            `Failed to transform the code block in: ${pc.bold(pc.blue(moduleId))}.`,
            "This likely happened due to invalid TypeScript syntax (see detype's error message above). You can either:",
            '- Fix the code block syntax',
            '- Set the code block language to js instead of ts',
            '- Use custom magic comments (see: https://github.com/brillout/docpress/?tab=readme-ov-file#detype-custom-magic-comments)',
          ].join('\n') + '\n',
        )
        continue
      }
      // Clean up both JS and TS code blocks: correct diff comments and apply custom magic comment replacements
      codeBlockContentJs = correctCodeDiffComments(codeBlockContentJs)
      codeBlockContentJs = processMagicComments(codeBlockContentJs)
      const codeBlockContentTs = processMagicComments(codeBlockContent)

      // No replacement needed if JS and TS code are still identical
      if (codeBlockContentTs === codeBlockContentJs) continue

      // Update code block open delimiter
      const codeBlockLangJs =
        codeBlockLang === 'vue'
          ? 'vue'
          : // ts => js | tsx => jsx
            codeBlockLang.replace('t', 'j')
      const codeBlockOpenJs = codeBlockOpen.replace(codeBlockLang, codeBlockLangJs)

      const codeBlockJs = `${codeBlockOpenJs}\n${codeBlockContentJs}${codeBlockClose}`
      const codeBlockTs = `${codeBlockOpen}\n${codeBlockContentTs}${codeBlockClose}`

      // Done
      replacement = wrapCodeSnippets(codeBlockJs, codeBlockTs, codeBlockIndent)
    }

    const blockStartIndex = match.index!
    const blockEndIndex = blockStartIndex + codeBlockOuterStr.length
    magicString.overwrite(blockStartIndex, blockEndIndex, replacement)
  }

  return getMagicStringResult()
}

function wrapCodeSnippets(codeBlockJs: string, codeBlockTs: string, codeBlockIndent: string) {
  // Combine JS & TS code blocks
  let codeSnippets = `${codeBlockJs}\n${codeBlockTs}`

  // Wrap with <CodeSnippets>
  codeSnippets = `<CodeSnippets>\n${codeSnippets}\n</CodeSnippets>`

  // Restore indentation
  codeSnippets = restoreCodeBlockIndent(codeSnippets, codeBlockIndent)

  return codeSnippets
}
function removeCodeBlockIndent(code: string, codeBlockIndent: string, moduleId: string) {
  if (!codeBlockIndent.length) return code
  return code
    .split('\n')
    .map((line) => {
      const lineStart = codeBlockIndent.trimEnd()
      assertUsage(
        line.startsWith(lineStart),
        `In ${pc.bold(pc.blue(moduleId))} the line '${pc.bold(line)}' must start with '${pc.bold(lineStart)}'`,
      )
      return line.slice(codeBlockIndent.length)
    })
    .join('\n')
}
function restoreCodeBlockIndent(code: string, codeBlockIndent: string) {
  if (!codeBlockIndent.length) return code
  return code
    .split('\n')
    .map((line) => `${codeBlockIndent}${line}`)
    .join('\n')
}
function processMagicComments(code: string) {
  // @detype-rename DummyLayout Layout
  const renameCommentRE = /^\/\/\s@detype-rename\s([^ ]+) ([^ ]+)\n/gm
  const matches = Array.from(code.matchAll(renameCommentRE))

  if (matches.length) {
    for (let i = 0; i < matches.length / 2; i++) {
      const match = matches[i]
      const [fullMatch, renameFrom, renameTo] = match
      code = code.split(fullMatch).join('').replaceAll(renameFrom, renameTo)
    }
  }

  return code.replaceAll('//~', '')
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
