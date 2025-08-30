export { detypePlugin }

import type { PluginOption } from 'vite'
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
      const codeNew = await transformCode(code)
      return codeNew
    },
  }
}

async function transformCode(code: string) {
  const matches = Array.from(code.matchAll(codeBlockRE))
  if (matches.length === 0) return

  let codeNew = `import { CodeSnippets, CodeSnippet } from '@brillout/docpress';\n\n`
  let lastIndex = 0

  for (const match of matches) {
    let [fullMatch, linePrefix, lang, tsCode] = match
    const tsCodeBlockOpen = fullMatch.split('\n')[0].slice(linePrefix.length)

    const blockStart = match.index
    const blockEnd = blockStart + fullMatch.length

    codeNew += code.slice(lastIndex, blockStart)

    if (linePrefix.length > 0) {
      tsCode = stripStarts(tsCode, linePrefix)
    }

    if (tsCodeBlockOpen.includes('ts-only')) {
      codeNew += `${linePrefix}<CodeSnippet language={'ts'} tsOnly={'true'}>\n${fullMatch}\n${linePrefix}</CodeSnippet>`
    } else {
      const jsCode = await detype(tsCode.replaceAll('.ts', '.js'), `tsCode.${lang}`, {
        removeTsComments: true,
        prettierOptions,
      })
      const jsLang = lang === 'vue' ? 'vue' : lang.replace('t', 'j') // ts => js | tsx => jsx
      const jsCodeBlockOpen = tsCodeBlockOpen.replace(lang, jsLang)
      const codeBlockClose = '```'

      const tsCodeSnippet = `<CodeSnippet language={'ts'}>\n${tsCodeBlockOpen}\n${tsCode}${codeBlockClose}\n</CodeSnippet>`
      const jsCodeSnippet = `<CodeSnippet language={'js'}>\n${jsCodeBlockOpen}\n${jsCode}${codeBlockClose}\n</CodeSnippet>`
      const codeSnippets = putBackStarts(
        `<CodeSnippets>\n${tsCodeSnippet}\n${jsCodeSnippet}\n</CodeSnippets>`,
        linePrefix,
      )

      codeNew += codeSnippets
    }

    lastIndex = blockEnd
  }
  codeNew += code.slice(lastIndex)

  return codeNew
}

function stripStarts(code: string, linePrefix: string) {
  return code
    .split('\n')
    .map((line) => line.slice(linePrefix.length))
    .join('\n')
}

function putBackStarts(code: string, linePrefix: string) {
  if (!linePrefix.length) {
    return code
  }
  return code
    .split('\n')
    .map((line) => `${linePrefix}${line}`)
    .join('\n')
}
