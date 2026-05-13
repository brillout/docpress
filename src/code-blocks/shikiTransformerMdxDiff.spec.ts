import { describe, it, expect } from 'vitest'
import { codeToHtml } from 'shiki'
import { transformerNotationDiff } from '@shikijs/transformers'
import { shikiTransformerMdxDiff } from './shikiTransformerMdxDiff.js'

async function highlight(code: string, lang: string = 'mdx') {
  return codeToHtml(code, {
    lang,
    theme: 'github-light',
    transformers: [shikiTransformerMdxDiff(), transformerNotationDiff()],
  })
}

describe('shikiTransformerMdxDiff', () => {
  it('parses trailing diff notation in mdx code blocks', async () => {
    const html = await highlight('<SomeComponent /> // [!code --]')
    expect(html).toContain('has-diff')
    expect(html).toContain('line diff remove')
    expect(html).not.toContain('[!code --]')
  })

  it('parses jsx-style standalone markers in mdx code blocks', async () => {
    const html = await highlight('{/* [!code ++] */}\n<SomeComponent />')
    expect(html).toContain('has-diff')
    expect(html).toContain('line diff add')
    expect(html).not.toContain('[!code ++]')
  })

  it('does not alter non-mdx languages', async () => {
    const html = await highlight('const answer = 42 // [!code ++]', 'js')
    expect(html).toContain('has-diff')
    expect(html).toContain('line diff add')
    expect(html).not.toContain('[!code ++]')
  })
})
