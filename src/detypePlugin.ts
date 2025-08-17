export { detypePlugin }

import type { PluginOption } from 'vite'
import module from 'node:module'

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

const tsBlockRegex = /```ts\s*([\s\S]*?)\s*```/g

async function transformCode(code: string) {
  let codeNew = ''
  let lastIndex = 0

  const matches = [...code.matchAll(tsBlockRegex)]

  if (matches.length === 0) {
    return code
  }

  for (const match of matches) {
    const [fullMatch, tsCode] = match
    const blockStart = match.index
    const blockEnd = blockStart + fullMatch.length

    codeNew += code.slice(lastIndex, blockEnd)

    const jsCode = await transform(tsCode.trim().replaceAll('.ts', '.js'), 'tsCode.ts', {
      removeTsComments: true,
    })

    codeNew += `\n\`\`\`js\n${jsCode}\`\`\``

    lastIndex = blockEnd
  }
  codeNew += code.slice(lastIndex)

  return codeNew
}
