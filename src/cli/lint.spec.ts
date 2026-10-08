import { describe, it, expect, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { lintDocs } from './lint.js'

const tmpDirs: string[] = []
afterAll(() => tmpDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })))

/** Creates a repository with the given files (paths relative to the repository root) and lints its `docs/` directory */
function lint(files: Record<string, string>) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'docpress-lint-'))
  tmpDirs.push(repoRoot)
  fs.mkdirSync(path.join(repoRoot, '.git'))
  files = { 'docs/+docpress.tsx': "const config = { name: 'Demo', url: 'https://example.org' }", ...files }
  for (const [filePath, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(repoRoot, filePath)), { recursive: true })
    fs.writeFileSync(path.join(repoRoot, filePath), content)
  }
  return lintDocs(path.join(repoRoot, 'docs'))
}

describe('docpress lint', () => {
  it('accepts valid docs', () => {
    const { errors, stats } = lint({
      'docs/pages/index/+Page.mdx': 'Welcome, see <Link href="/some-page#some-section" />.',
      'docs/pages/some-page/+Page.mdx': [
        '## Some section',
        'See <Link href="#some-section" /> and <Link href="/">Home</Link> and [an external link](https://github.com).',
      ].join('\n'),
      'docs/components/Note.mdx': 'Some note, see <Link href="/some-page#some-section" />.',
      'README.md': 'See [some section](https://example.org/some-page#some-section) and [some file](/docs/README.md).',
    })
    expect(errors).toEqual([])
    expect(stats).toEqual({ docsUrl: 'https://example.org', pages: 2, components: 1, readmes: 1 })
  })

  it('resolves anchors the same way DocPress determines heading IDs', () => {
    const { errors } = lint({
      'docs/pages/api/+Page.mdx': [
        '## `<Config>` & `<Head>`',
        '## Some Title{#custom-anchor}',
        '### Déjà vu',
        '<h2 id="explicitId">Explicit ID</h2>',
        '<Prop id="otherId" />',
        '```js',
        '# Not a heading',
        '```',
        '<Link href="#config-head" />',
        '<Link href="#custom-anchor" />',
        '<Link href="#deja-vu" />',
        '<Link href="#explicitId" />',
        '<Link href="#otherId" />',
        '<Link href="#some-title" />',
        '<Link href="#not-a-heading" />',
        '<Link href="#explicitid" />',
      ].join('\n'),
    })
    expect(errors).toEqual([
      'pages/api/+Page.mdx:14: broken anchor "#some-title" — no heading "#some-title" on /api',
      'pages/api/+Page.mdx:15: broken anchor "#not-a-heading" — no heading "#not-a-heading" on /api',
      'pages/api/+Page.mdx:16: broken anchor "#explicitid" — no heading "#explicitid" on /api',
    ])
  })

  it('detects broken anchors and unknown pages', () => {
    const { errors } = lint({
      'docs/pages/some-page/+Page.mdx': '## Some section',
      'docs/pages/other-page/+Page.mdx': [
        '<Link href="/some-page#some-section" />',
        '<Link href="/some-page#wrong-section" />',
        '<Link href="/some-page/#wrong-section">Trailing slash</Link>',
        '<Link href="/unknown-page#some-section" />',
        // Not checked: relative links without anchor are validated by <Link> at build-time
        '<Link href="/unknown-page" />',
      ].join('\n'),
      'docs/components/Note.mdx': [
        '<Link href="/some-page#wrong-section" />',
        // Not checked: a component doesn't have a URL of its own
        '<Link href="#wrong-section" />',
      ].join('\n'),
    })
    expect(errors).toEqual([
      'pages/other-page/+Page.mdx:2: broken anchor "/some-page#wrong-section" — no heading "#wrong-section" on /some-page',
      'pages/other-page/+Page.mdx:3: broken anchor "/some-page/#wrong-section" — no heading "#wrong-section" on /some-page',
      'pages/other-page/+Page.mdx:4: link to unknown page "/unknown-page#some-section" (there isn\'t any page with URL /unknown-page)',
      'components/Note.mdx:1: broken anchor "/some-page#wrong-section" — no heading "#wrong-section" on /some-page',
    ])
  })

  it('enforces the link convention', () => {
    const { errors } = lint({
      'docs/pages/some-page/+Page.mdx': [
        '## Some section',
        '[Bare markdown link](/some-page)',
        '[Bare markdown link with anchor](#some-section)',
        '<Link href="https://example.org/some-page">Absolute link</Link>',
        '<a href="http://www.example.org/some-page#some-section">Absolute link</a>',
        '[Absolute markdown link](https://example.org/some-page)',
        // Not internal links
        '![Image](/logo.svg)',
        '[Other domain](https://example.org.evil.com/some-page)',
        '[Other domain](https://example.organic/some-page)',
        '[Protocol-relative URL](//cdn.example.com/some-file.js)',
      ].join('\n'),
    })
    expect(errors).toEqual([
      'pages/some-page/+Page.mdx:2: bare markdown internal link "](/some-page)" — use <Link href="/some-page" /> instead',
      'pages/some-page/+Page.mdx:3: bare markdown internal link "](#some-section)" — use <Link href="#some-section" /> instead',
      'pages/some-page/+Page.mdx:4: absolute internal link href="https://example.org/some-page" — use a relative href="/some-page" instead',
      'pages/some-page/+Page.mdx:5: absolute internal link href="http://www.example.org/some-page#some-section" — use a relative href="/some-page#some-section" instead',
      'pages/some-page/+Page.mdx:6: bare markdown internal link "](https://example.org/some-page)" — use <Link href="/some-page" /> instead',
    ])
  })

  it('ignores code blocks, code spans, and comments', () => {
    const { errors } = lint({
      'docs/pages/some-page/+Page.mdx': [
        '```mdx',
        '[Example](/some-page) <Link href="#example" />',
        '```',
        ' - List item:',
        '   ~~~mdx',
        '   ```',
        '   [Example](/some-page)',
        '   ```',
        '   ~~~',
        '> ```mdx',
        '> [Example](/some-page)',
        '> ```',
        'Inline `[example](/some-page)` and ``<Link href="#example" />``',
        '{/* [Example](/some-page) */}',
        '[Not ignored](/some-page)',
      ].join('\n'),
    })
    expect(errors).toEqual([
      'pages/some-page/+Page.mdx:15: bare markdown internal link "](/some-page)" — use <Link href="/some-page" /> instead',
    ])
  })

  it("follows Vike's routing", () => {
    const { errors } = lint({
      'docs/pages/index/+Page.mdx': '## Intro',
      'docs/pages/(marketing)/pricing/+Page.mdx': '## Plans',
      'docs/pages/pageContext-json/+Page.mdx': '## Avoid requests',
      'docs/pages/pageContext-json/+route.ts': "export default '/pageContext.json'",
      'docs/pages/landing/+Page.tsx': 'export default () => <h2 id="hero">Hero</h2>',
      'docs/pages/guide/+Page.mdx': [
        '<Link href="/#intro" />',
        '<Link href="/pricing#plans" />',
        '<Link href="/pageContext.json#avoid-requests" />',
        // Anchors of non-MDX pages aren't checked
        '<Link href="/landing#unknown" />',
        '<Link href="/index#intro" />',
        '<Link href="/marketing/pricing#plans" />',
        '<Link href="/pageContext-json#avoid-requests" />',
      ].join('\n'),
    })
    expect(errors).toEqual([
      'pages/guide/+Page.mdx:5: link to unknown page "/index#intro" (there isn\'t any page with URL /index)',
      'pages/guide/+Page.mdx:6: link to unknown page "/marketing/pricing#plans" (there isn\'t any page with URL /marketing/pricing)',
      'pages/guide/+Page.mdx:7: link to unknown page "/pageContext-json#avoid-requests" (there isn\'t any page with URL /pageContext-json)',
    ])
  })

  it('supports static assets', () => {
    const { errors } = lint({
      'docs/public/llms.txt': '# Docs',
      'docs/pages/ai/+Page.mdx': [
        '[llms.txt](/llms.txt)',
        '[llms.txt](https://example.org/llms.txt)',
        '<a href="https://example.org/llms.txt">llms.txt</a>',
      ].join('\n'),
      'README.md': '[llms.txt](https://example.org/llms.txt) [Missing](https://example.org/missing.txt)',
    })
    expect(errors).toEqual([
      'pages/ai/+Page.mdx:2: absolute internal link "](https://example.org/llms.txt)" — use a relative "](/llms.txt)" instead',
      'pages/ai/+Page.mdx:3: absolute internal link href="https://example.org/llms.txt" — use a relative href="/llms.txt" instead',
      '../README.md:1: link to unknown page "https://example.org/missing.txt" (there isn\'t any page with URL /missing.txt)',
    ])
  })

  it('resolves absolute links of READMEs', () => {
    const { errors, stats } = lint({
      'docs/pages/some-page/+Page.mdx': '## Some section',
      'README.md': [
        // Relative links are relative to the repository (GitHub) — not ours to check
        '[Contributing](/CONTRIBUTING.md#docs) [Docs](#docs)',
        '<a href="https://example.org/some-page#some-section">Some section</a>',
        '[Home](https://example.org) [Some page](https://www.example.org/some-page/)',
        '[Wrong section](https://example.org/some-page#wrong-section)',
        '[Unknown page](https://example.org/unknown-page)',
      ].join('\n'),
      'docs/README.md': '[Unknown page](https://example.org/unknown-page)',
      'packages/some-package/README.md': '[Wrong section](http://example.org/some-page#wrong-section)',
      'node_modules/some-dependency/README.md': '[Unknown page](https://example.org/unknown-page)',
    })
    expect(errors).toEqual([
      '../README.md:4: broken anchor "https://example.org/some-page#wrong-section" — no heading "#wrong-section" on /some-page',
      '../README.md:5: link to unknown page "https://example.org/unknown-page" (there isn\'t any page with URL /unknown-page)',
      'README.md:1: link to unknown page "https://example.org/unknown-page" (there isn\'t any page with URL /unknown-page)',
      '../packages/some-package/README.md:1: broken anchor "http://example.org/some-page#wrong-section" — no heading "#wrong-section" on /some-page',
    ])
    expect(stats.readmes).toBe(3)
  })
})
