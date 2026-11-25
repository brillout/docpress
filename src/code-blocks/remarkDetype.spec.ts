import { describe, it, expect } from 'vitest'
import { compile } from '@mdx-js/mdx'
import { remarkDetype } from './remarkDetype.js'

describe('remarkDetype()', () => {
  it('throws upon a code block that cannot be transformed to JavaScript', async () => {
    const value = ['# Some page', '', '```ts', 'const a = 1', 'const a = 2', '```'].join('\n')
    const compilation = compile({ path: '/pages/some-page/+Page.mdx', value }, { remarkPlugins: [remarkDetype] })
    await expect(compilation).rejects.toThrow(
      /Failed to transform the code block at: .*\/pages\/some-page\/\+Page\.mdx.*, line 3\./,
    )
  })
})
