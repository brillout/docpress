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

const tsBlockRegex = /```(tsx?|vue)\n([\s\S]*?)```/g

async function transformCode(code: string) {
  let codeNew = `import { CodeSnippets } from '@brillout/docpress'\n`
  let lastIndex = 0

  const matches = [...code.matchAll(tsBlockRegex)]

  if (matches.length === 0) {
    return code
  }

  for (const match of matches) {
    const [tsCodeBlock, lang, tsCode] = match // lang = ts | tsx | vue
    const type = lang === 'vue' ? 'vue' : lang.replace('t', 'j') // ts => js | tsx => jsx

    const blockStart = match.index
    const blockEnd = blockStart + tsCodeBlock.length

    codeNew += code.slice(lastIndex, blockStart)

    const jsCode = await transform(tsCode.trim().replaceAll('.ts', '.js'), `tsCode.${lang}`, {
      removeTsComments: true,
      prettierOptions: {
        semi: false,
        singleQuote: true,
      },
    })

    const jsCodeBlock = `\n\`\`\`${type}\n${jsCode}\`\`\``

    codeNew += `\n<CodeSnippets>\n${jsCodeBlock}\n${tsCodeBlock}\n</CodeSnippets>`

    lastIndex = blockEnd
  }
  codeNew += code.slice(lastIndex)

  return codeNew
}
