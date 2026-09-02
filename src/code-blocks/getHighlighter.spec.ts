import { describe, it, expect } from 'vitest'
import { getHighlighter } from './getHighlighter.js'
import type { Highlighter } from 'shiki'

describe('getHighlighter()', () => {
  it('highlights lazily embedded grammars regardless of the order in which grammars are loaded', async () => {
    // The markdown grammar lazily embeds the `yaml` grammar for the frontmatter
    const code = ['---', 'name: "vike"', '---', '', 'See https://vike.dev/llms.txt'].join('\n')
    const highlight = (highlighter: Highlighter) => highlighter.codeToHtml(code, { lang: 'md', theme: 'github-light' })
    // Same options as Rehype Pretty Code
    const options = { themes: ['github-light' as const], langs: ['plaintext' as const] }

    const highlighter1 = await getHighlighter(options)
    await highlighter1.loadLanguage('md')
    const html1 = highlight(highlighter1)

    const highlighter2 = await getHighlighter(options)
    await highlighter2.loadLanguage('yaml')
    await highlighter2.loadLanguage('md')
    const html2 = highlight(highlighter2)

    expect(html1).toBe(html2)
    // The frontmatter is highlighted as YAML: `name` is a YAML key
    expect(html1).toContain('>name</span>')
  })
  it('caches the highlighter per options', () => {
    const options = { themes: ['github-light' as const], langs: ['plaintext' as const] }
    expect(getHighlighter(options)).toBe(getHighlighter({ ...options }))
  })
})
