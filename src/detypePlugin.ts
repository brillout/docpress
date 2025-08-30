export { detypePlugin }

import type { PluginOption } from 'vite'
import module from 'node:module'
import { assertUsage } from './utils/assert.js'
import pc from '@brillout/picocolors'
// Cannot use `import { transform } from 'detype'` as it results in errors,
// and the package has no default export. Using `module.createRequire` instead.
const { transform: detype } = module.createRequire(import.meta.url)('detype') as typeof import('detype')

const prettierOptions: NonNullable<Parameters<typeof detype>[2]>['prettierOptions'] = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'none',
}
// Find TypeScript code blocks.
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
      const codeNew = await transformCode(code, moduleId)
      return codeNew
    },
  }
}

async function transformCode(code: string, moduleId: string) {
  const matches = Array.from(code.matchAll(codeBlockRE))
  if (matches.length === 0) return

  let codeNew = `import { CodeSnippets, CodeSnippet } from '@brillout/docpress';\n\n`
  let lastIndex = 0

  for (const match of matches) {
    let [codeBlockOuterStr, linePrefix, codeBlockLang, codeBlockContent] = match
    const codeBlockFirstLine = codeBlockOuterStr.split('\n')[0].slice(linePrefix.length)

    const blockStartIndex = match.index
    const blockEnd = blockStartIndex + codeBlockOuterStr.length

    codeNew += code.slice(lastIndex, blockStartIndex)

    if (linePrefix.length > 0) {
      codeBlockContent = removeLinePrefix(codeBlockContent, linePrefix, moduleId)
    }

    if (codeBlockFirstLine.includes('ts-only')) {
      codeNew += `${linePrefix}<CodeSnippet language={'ts'} tsOnly={'true'}>\n${codeBlockOuterStr}\n${linePrefix}</CodeSnippet>`
    } else {
      const codeBlockContentJs = await detype(codeBlockContent.replaceAll('.ts', '.js'), `tsCode.${codeBlockLang}`, {
        removeTsComments: true,
        prettierOptions,
      })
      const jsLang = codeBlockLang === 'vue' ? 'vue' : codeBlockLang.replace('t', 'j') // ts => js | tsx => jsx
      const codeBlockFirstLineJs = codeBlockFirstLine.replace(codeBlockLang, jsLang)
      const codeBlockClose = '```'

      const codeSnippetJs = `<CodeSnippet language={'ts'}>\n${codeBlockFirstLine}\n${codeBlockContent}${codeBlockClose}\n</CodeSnippet>`
      const codeSnippetTs = `<CodeSnippet language={'js'}>\n${codeBlockFirstLineJs}\n${codeBlockContentJs}${codeBlockClose}\n</CodeSnippet>`
      const codeSnippets = restoreLinePrefix(
        `<CodeSnippets>\n${codeSnippetJs}\n${codeSnippetTs}\n</CodeSnippets>`,
        linePrefix,
      )

      codeNew += codeSnippets
    }

    lastIndex = blockEnd
  }
  codeNew += code.slice(lastIndex)

  return codeNew
}

function removeLinePrefix(code: string, linePrefix: string, moduleId: string) {
  return code
    .split('\n')
    .map((line) => {
      assertUsage(
        line.startsWith(linePrefix),
        `In ${pc.bold(pc.blue(moduleId))} the line ${pc.bold(line)} must start with ${pc.bold(linePrefix)}`,
      )
      return line.slice(linePrefix.length)
    })
    .join('\n')
}

function restoreLinePrefix(code: string, linePrefix: string) {
  if (!linePrefix.length) {
    return code
  }
  return code
    .split('\n')
    .map((line) => `${linePrefix}${line}`)
    .join('\n')
}
