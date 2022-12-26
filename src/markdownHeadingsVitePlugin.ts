export { markdownHeadingsVitePlugin }
export type { MarkdownHeading }

import { assert, determineSectionUrlHash } from '../src/utils/server'
import os from 'os'

type MarkdownHeading = {
  title: string
  headingId: string | null
  headingLevel: number
  titleAddendum?: string
}

function markdownHeadingsVitePlugin() {
  return {
    name: 'mdx-headings',
    enforce: 'pre',
    transform: async (code: string, id: string) => {
      if (!id.includes('.page.') || !id.endsWith('.mdx')) {
        return
      }
      const codeNew = transform(code)
      return codeNew
    }
  }
}

function transform(code: string) {
  const headings: MarkdownHeading[] = []
  let isCodeBlock = false
  let codeNew = code
    .split('\n')
    .map((line) => {
      // Skip code blocks, e.g.
      // ~~~md
      // # Markdown Example
      // Bla
      // ~~~
      if (line.startsWith('~~~') || line.startsWith('```')) {
        isCodeBlock = !isCodeBlock
        return line
      }
      if (isCodeBlock) {
        return line
      }

      if (line.startsWith('#')) {
        const { headingId, headingLevel, title, headingHtml } = parseMarkdownHeading(line)
        headings.push({ headingId, headingLevel, title })
        return headingHtml
      }

      return line
    })
    .join('\n')
  const headingsExportCode = `export const headings = [${headings
    .map((heading) => JSON.stringify(heading))
    .join(', ')}];`
  codeNew += `\n\n${headingsExportCode}\n`
  return codeNew
}

function parseMarkdownHeading(line: string): MarkdownHeading & { headingHtml: string } {
  const [lineBegin, ...lineWords] = line.split(' ')
  assert(lineBegin.split('#').join('') === '', { line, lineWords })
  const headingLevel = lineBegin.length

  const titleMdx = lineWords.join(' ')
  assert(!titleMdx.startsWith(' '), { line, lineWords })
  assert(titleMdx, { line, lineWords })

  const headingId = determineSectionUrlHash(titleMdx)
  const title = titleMdx
  const titleParsed = parseTitle(title)
  assert(headingId === null || headingId.length > 0)
  const headingAttrId = headingId === null ? '' : ` id="${headingId}"`
  const headingHtml = `<h${headingLevel}${headingAttrId}>${titleParsed}</h${headingLevel}>`

  const heading = { headingLevel, title, headingId, headingHtml }
  return heading
}

function parseTitle(titleMarkdown: string): string {
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
    if (isWindows()) {
      textEscaped = textEscaped.replace(/\r/, '')
    }
    return `{'${textEscaped}'}`
  }
}

function isWindows() {
  return os.platform() === 'win32'
}
