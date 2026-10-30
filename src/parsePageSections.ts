export { parsePageSections }
export { extractPageSections }
export { remarkPluginsSyntax }
export type { PageSection }

import type { PluginOption } from 'vite'
import { assert, assertUsage } from './utils/assert.js'
import { determineSectionUrlHash } from './utils/determineSectionUrlHash.js'
import os from 'os'
import pc from '@brillout/picocolors'
import { createProcessor } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import type { Processor } from 'unified'

const remarkPluginsSyntax = [remarkGfm, remarkDirective]
// Which lines are headings is block structure: DocPress renders a heading's text itself, so MDX's inline syntax is left out
function remarkBlocksOnly(this: Processor) {
  const data = this.data() as { micromarkExtensions: { text?: unknown }[] }
  data.micromarkExtensions = data.micromarkExtensions.map(({ text, ...extension }) => extension)
}
const mdxProcessor = createProcessor({ remarkPlugins: [...remarkPluginsSyntax, remarkBlocksOnly] })

type PageSection = {
  pageSectionTitle: string
  pageSectionId: string | null
  pageSectionLevel: number
}

function parsePageSections(): PluginOption {
  return {
    name: '@brillout/docpress:parsePageSections',
    enforce: 'pre',
    transform: async (code: string, id: string) => {
      if (!id.endsWith('+Page.mdx')) {
        return
      }
      const codeNew = transform(code)
      return codeNew
    },
  }
}

function transform(code: string) {
  const { codeNew, pageSections } = extractPageSections(code)
  return `${codeNew}\n\nexport const pageSectionsExport = ${JSON.stringify(pageSections)};\n`
}

/** Replaces the Markdown headings with HTML headings (with their `id`) and returns them as page sections — also used by `$ docpress lint` */
function extractPageSections(code: string) {
  const tree = mdxProcessor.parse(code)
  const headingLines = new Set<number>()
  visit(tree, 'heading', (node) => {
    headingLines.add(node.position!.start.line - 1)
  })
  const lines = code.split('\n').map((line, i) => {
    /* TO-DO/eventually: implement.
    || line.startsWith('<h2')
    */
    // E.g. `## Some Title`, also with tabs or more spaces after `##`, and indented by up to 3 spaces (CommonMark)
    const heading = headingLines.has(i) && /^( {0,3})(#{1,6})[ \t]+(?=\S)/.exec(line)
    if (heading) {
      const [match, indent, hashes] = heading
      return parsePageSection(indent!, hashes!.length, line.slice(match.length))
    }

    return line
  })
  const headings = lines.filter((line) => typeof line !== 'string')
  makeIdsUnique(headings)
  const codeNew = lines.map((line) => (typeof line === 'string' ? line : getHeadingHtml(line))).join('\n')
  const pageSections: PageSection[] = headings.map(({ isCustomAnchor, indent, ...pageSection }) => pageSection)
  return { codeNew, pageSections }
}

type HeadingLine = PageSection & { isCustomAnchor: boolean; indent: string }

function parsePageSection(indent: string, pageSectionLevel: number, titleMdx: string): HeadingLine {
  let pageSectionTitle = titleMdx
  let anchor = titleMdx
  {
    // Support custom anchor: `## Some Title{#custom-anchor}`
    const customAnchor = /(?<={#).*(?=})/g.exec(titleMdx)?.[0]
    if (customAnchor) {
      anchor = customAnchor
      pageSectionTitle = titleMdx.replace(/{#.*}/g, '')
    }
  }
  const pageSectionId = determineSectionUrlHash(anchor)
  assert(pageSectionId === null || pageSectionId.length > 0)

  return { pageSectionId, pageSectionLevel, pageSectionTitle, isCustomAnchor: anchor !== titleMdx, indent }
}

// A page may repeat a heading title: `#setup`, `#setup-1`, ... (like GitHub). A heading keeps its own id unless a custom
// anchor or an earlier heading has it, and a suffix never takes another heading's own id.
function makeIdsUnique(headings: HeadingLine[]) {
  const idsOwn = new Set(headings.map((heading) => heading.pageSectionId))
  const customAnchors = new Map<string, HeadingLine>()
  const getMdx = (h: HeadingLine) => pc.bold(`${'#'.repeat(h.pageSectionLevel)} ${h.pageSectionTitle}`)
  headings.forEach((heading) => {
    const id = heading.pageSectionId
    if (!heading.isCustomAnchor || id === null) return
    const first = customAnchors.get(id) ?? heading
    assertUsage(
      first === heading,
      `The headings ${getMdx(first)} and ${getMdx(heading)} have the same URL hash ${pc.bold(`#${id}`)}, give them different {#custom-anchor}`,
    )
    customAnchors.set(id, heading)
  })
  const idsTaken = new Set(customAnchors.keys())
  headings.forEach((heading) => {
    const idBase = heading.pageSectionId
    if (idBase === null || heading.isCustomAnchor) return
    let id = idBase
    for (let i = 1; idsTaken.has(id) || (id !== idBase && idsOwn.has(id)); i++) id = `${idBase}-${i}`
    heading.pageSectionId = id
    idsTaken.add(id)
  })
}

function getHeadingHtml({ pageSectionLevel, pageSectionTitle, pageSectionId, indent }: HeadingLine): string {
  const titleParsed = parseMarkdownMini(pageSectionTitle)
  const headingId = pageSectionId === null ? '' : ` id="${pageSectionId}"`
  return `${indent}<h${pageSectionLevel}${headingId}>${titleParsed}</h${pageSectionLevel}>`
}

function parseMarkdownMini(titleMarkdown: string): string {
  type Part = { nodeType: 'text' | 'code'; content: string }
  const parts: Part[] = []
  let current: Part | undefined
  titleMarkdown.split('').forEach((letter) => {
    if (letter === '`') {
      if (current?.nodeType === 'code') {
        // </code>
        parts.push(current)
        current = undefined
      } else {
        // <code>
        if (current) {
          parts.push(current)
        }
        current = { nodeType: 'code', content: '' }
      }
    } else {
      if (!current) {
        current = { nodeType: 'text', content: '' }
      }
      current.content += letter
    }
  })
  if (current) {
    parts.push(current)
  }

  const titleHtml = parts
    .map((part) => {
      if (part.nodeType === 'code') {
        return `<code>${serializeText(part.content)}</code>`
      } else {
        assert(part.nodeType === 'text', { parts })
        return serializeText(part.content)
      }
    })
    .join('')

  return titleHtml

  function serializeText(text: string) {
    let textEscaped = text.split("'").join("\\'")
    // https://github.com/brillout/docpress/pull/2
    if (isWindows()) {
      textEscaped = textEscaped.replace(/\r/, '')
    }
    return `{'${textEscaped}'}`
  }
}

function isWindows() {
  return os.platform() === 'win32'
}
