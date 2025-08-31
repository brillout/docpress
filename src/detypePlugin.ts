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
const codeBlockRE = /^(.*)```(tsx?|vue)[^\n]*\n([\s\S]*?)```/gm

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

  magicString.prepend(`import { CodeSnippets, CodeSnippet } from '@brillout/docpress';\n\n`)

  // [Claude AI] Process matches in reverse order to avoid offset issues
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const [codeBlockOuterStr, codeBlockIndent, codeBlockLang, codeBlockContentWithIndent] = match

    // Remove indentation
    const codeBlockOpen = codeBlockOuterStr.split('\n')[0].slice(codeBlockIndent.length)
    const codeBlockContent = removeCodeBlockIndent(codeBlockContentWithIndent, codeBlockIndent, moduleId)

    let replacement: string
    if (codeBlockOpen.includes('ts-only')) {
      replacement = `${codeBlockIndent}<CodeSnippet codeLang="ts" tsOnly>\n${codeBlockOuterStr}\n${codeBlockIndent}</CodeSnippet>`
    } else {
      // someFileName.ts => someFileName.js
      let codeBlockContentJs = codeBlockContent.replaceAll('.ts', '.js')
      // Remove TypeScript
      codeBlockContentJs = await detype(codeBlockContentJs, `some-dummy-filename.${codeBlockLang}`, {
        removeTsComments: true,
        prettierOptions,
      })
      // Update code block open delimiter
      const codeBlockLangJs =
        codeBlockLang === 'vue'
          ? 'vue'
          : // ts => js | tsx => jsx
            codeBlockLang.replace('t', 'j')
      const codeBlockOpenJs = codeBlockOpen.replace(codeBlockLang, codeBlockLangJs)
      const codeBlockClose = '```'
      // Wrap with <CodeSnippets>
      const codeSnippetTs = `<CodeSnippet codeLang="ts">\n${codeBlockOpen}\n${codeBlockContent}${codeBlockClose}\n</CodeSnippet>`
      const codeSnippetJs = `<CodeSnippet codeLang="js">\n${codeBlockOpenJs}\n${codeBlockContentJs}${codeBlockClose}\n</CodeSnippet>`
      let codeSnippets = `<CodeSnippets>\n${codeSnippetJs}\n${codeSnippetTs}\n</CodeSnippets>`
      // Restore indentation
      codeSnippets = restoreCodeBlockIndent(codeSnippets, codeBlockIndent)
      // Done
      replacement = codeSnippets
    }

    const blockStartIndex = match.index!
    const blockEndIndex = blockStartIndex + codeBlockOuterStr.length
    magicString.overwrite(blockStartIndex, blockEndIndex, replacement)
  }

  return getMagicStringResult()
}

function removeCodeBlockIndent(code: string, codeBlockIndent: string, moduleId: string) {
  if (!codeBlockIndent.length) return code
  return code
    .split('\n')
    .map((line) => {
      assertUsage(
        line.startsWith(codeBlockIndent.trimEnd()),
        `In ${pc.bold(pc.blue(moduleId))} the line ${pc.bold(line)} must start with ${pc.bold(codeBlockIndent)}`,
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
