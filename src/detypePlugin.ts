export { detypePlugin }

import type { PluginOption } from 'vite'
import module from 'node:module'

// Cannot use `import { transform } from 'detype'` as it results in errors,
// and the package has no default export. Using `module.createRequire` instead.
const { transform } = module.createRequire(import.meta.url)('detype') as typeof import('detype')

function detypePlugin(): PluginOption {
  return {
    name: '@brillout/docpress:detypePlugin',
    enforce: 'pre',
    transform: async (code: string, id: string) => {
      if (!id.endsWith('+Page.mdx')) {
        return
      }
      const codeNew = await transformCode(code)

      return codeNew
    },
  }
}

const codeBlockRE = /^([ \t]{0,3}>?[ \t]?)```(tsx?|vue)[^\n]*\n([\s\S]*?)```/gm
const prettierOptions = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
}

async function transformCode(code: string) {
  const matches = Array.from(code.matchAll(codeBlockRE))
  if (matches.length === 0) {
    return code
  }

  let codeNew = `import { CodeSnippets, CodeSnippet } from '@brillout/docpress';\n\n`
  let lastIndex = 0

  for (const match of matches) {
    let [fullMatch, startsWith, lang, tsCode] = match
    const tsOpeningCode = fullMatch.split('\n')[0].slice(startsWith.length)

    const blockStart = match.index
    const blockEnd = blockStart + fullMatch.length

    codeNew += code.slice(lastIndex, blockStart)

    if (startsWith.length > 0) {
      tsCode = stripStarts(tsCode, startsWith)
    }

    if (tsOpeningCode.includes('ts-only')) {
      codeNew += `${startsWith}<CodeSnippet language={'ts'} tsOnly={'true'}>\n${fullMatch}\n${startsWith}</CodeSnippet>`
    } else {
      const jsCode = await transform(tsCode.replaceAll('.ts', '.js'), `tsCode.${lang}`, {
        removeTsComments: true,
        prettierOptions,
      })
      const jsLang = lang === 'vue' ? 'vue' : lang.replace('t', 'j') // ts => js | tsx => jsx
      const jsOpeningCode = tsOpeningCode.replace(lang, jsLang)
      const closing = `\`\`\``

      const jsCodeSnippet = `<CodeSnippet language={'js'}>\n${jsOpeningCode}\n${jsCode}${closing}\n</CodeSnippet>`
      const tsCodeSnippet = `<CodeSnippet language={'ts'}>\n${tsOpeningCode}\n${tsCode}${closing}\n</CodeSnippet>`
      const codeSnippets = putBackStarts(
        `<CodeSnippets>\n${tsCodeSnippet}\n${jsCodeSnippet}\n</CodeSnippets>`,
        startsWith,
      )

      codeNew += codeSnippets
    }

    lastIndex = blockEnd
  }
  codeNew += code.slice(lastIndex)

  return codeNew
}

function stripStarts(code: string, startsWith: string) {
  return code
    .split('\n')
    .map((line) => line.slice(startsWith.length))
    .join('\n')
}

function putBackStarts(code: string, startsWith: string) {
  if (!startsWith.length) {
    return code
  }
  return code
    .split('\n')
    .map((line) => `${startsWith}${line}`)
    .join('\n')
}
