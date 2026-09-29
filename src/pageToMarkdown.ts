export { pageToMarkdown }

// The page as Markdown, e.g. to paste it into an LLM. From what's rendered, not from the MDX source: links have their
// titles and absolute URLs, a code block with choices has the selected one, components are rendered, and there's no UI
// (buttons, dropdowns, icons).
function pageToMarkdown(): string {
  const content = document.querySelector('.page-content')
  if (!content) return ''
  const title = content.querySelector('.page-header h1')?.textContent?.trim()
  const blocks = [
    title && `# ${title}`,
    `Source: ${window.location.origin}${window.location.pathname}`,
    toBlocks(content),
  ]
  return `${blocks.filter(Boolean).join('\n\n')}\n`
}

const blockTags = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DETAILS',
  'DIV',
  'DL',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'SUMMARY',
  'TABLE',
  'UL',
])
const skippedTags = new Set(['BUTTON', 'INPUT', 'NOSCRIPT', 'SCRIPT', 'SELECT', 'STYLE', 'SVG', 'TEMPLATE', 'TEXTAREA'])
// UI, not content
const skippedSelector = [
  '.page-header',
  '.page-footer',
  '.code-block-header',
  '.choice-group__selects',
  '[role="radiogroup"]',
  '[role="tablist"]',
  '.sr-only',
  '[aria-hidden="true"]',
].join(', ')

function isSkipped(element: Element): boolean {
  if (skippedTags.has(element.tagName.toUpperCase())) return true
  if (element.matches(skippedSelector)) return true
  // Not rendered, e.g. the choices not selected. (Collapsed content, e.g. `visibility: hidden`, is kept.)
  if (typeof element.checkVisibility === 'function') return !element.checkVisibility()
  return element.getClientRects().length === 0 && getComputedStyle(element).display === 'none'
}

// Block content: paragraphs, headings, lists, code blocks..., separated by a blank line. Loose inline content (e.g. a
// list item's text) is a paragraph.
function toBlocks(parent: Element): string {
  const blocks: string[] = []
  let inline = ''
  const flush = () => {
    blocks.push(inline.replace(/[ \t]+\n/g, '\n').trim())
    inline = ''
  }
  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      inline += collapseWhitespace(node.textContent ?? '')
      return
    }
    if (!(node instanceof Element) || isSkipped(node)) return
    if (!blockTags.has(node.tagName.toUpperCase())) {
      inline += toInline(node)
      return
    }
    flush()
    blocks.push(toBlock(node))
  })
  flush()
  return blocks.filter(Boolean).join('\n\n')
}

function toBlock(element: Element): string {
  const tag = element.tagName.toUpperCase()
  if (/^H[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${toInlineContent(element).trim()}`
  if (tag === 'P' || tag === 'SUMMARY') {
    const text = toInlineContent(element).trim()
    return text && tag === 'SUMMARY' ? `**${text}**` : text
  }
  if (tag === 'UL' || tag === 'OL') return toList(element)
  if (tag === 'PRE') return toCodeBlock(element)
  if (tag === 'BLOCKQUOTE') return toBlockquote(element)
  if (tag === 'TABLE') return toTable(element)
  if (tag === 'HR') return '---'
  return toBlocks(element)
}

function toList(list: Element): string {
  const isOrdered = list.tagName.toUpperCase() === 'OL'
  let n = Number(list.getAttribute('start') ?? 1)
  const items: string[] = []
  Array.from(list.children).forEach((item) => {
    if (item.tagName.toUpperCase() !== 'LI' || isSkipped(item)) return
    const marker = isOrdered ? `${n++}. ` : '- '
    const lines = toBlocks(item).split('\n')
    // A tight list: no blank lines between an item's paragraph and its sub-list
    const body = lines
      .filter((line, i) => line !== '' || !/^\s*([-*]|\d+\.) /.test(lines[i + 1] ?? ''))
      .map((line, i) => (i === 0 || line === '' ? line : `${' '.repeat(marker.length)}${line}`))
      .join('\n')
    items.push(`${marker}${body}`)
  })
  return items.join('\n')
}

function toCodeBlock(pre: Element): string {
  const code = pre.querySelector('code') ?? pre
  let language = pre.getAttribute('data-language') ?? code.getAttribute('data-language') ?? ''
  if (language === 'plaintext' || language === 'text') language = ''
  const lineElements = Array.from(code.querySelectorAll('[data-line]'))
  // An empty line holds a space (rehype-pretty-code); a notation comment (e.g. `// [!code ++]`) leaves a trailing one
  let lines = lineElements.length
    ? lineElements.map((line) => (line.textContent ?? '').replace(/\s+$/, ''))
    : (code.textContent ?? '').replace(/\n$/, '').split('\n')
  // Diffs: added and removed lines, or a whole file added or removed (<FileAdded>, <FileRemoved>)
  const fileDiff = pre.closest('.diff-entire-file-added') ? '+' : pre.closest('.diff-entire-file-removed') ? '-' : null
  const lineDiffs = lineElements.map((line) =>
    line.classList.contains('add') ? '+' : line.classList.contains('remove') ? '-' : null,
  )
  if (fileDiff || lineDiffs.some(Boolean)) {
    language = 'diff'
    lines = lines.map((line, i) => `${fileDiff ?? lineDiffs[i] ?? ' '} ${line}`.replace(/\s+$/, ''))
  }
  const text = lines.join('\n')
  const fence = '`'.repeat(Math.max(3, longestRun(text, '`') + 1))
  return `${fence}${language}\n${text}\n${fence}`
}

// Callouts: GitHub's alerts, which LLMs know too
const alerts: Record<string, string> = { 'callout-warning': 'WARNING', 'callout-danger': 'CAUTION' }
function toBlockquote(blockquote: Element): string {
  const alert = Object.entries(alerts).find(([className]) => blockquote.classList.contains(className))?.[1]
  const body = toBlocks(blockquote)
  if (!body) return ''
  const lines = (alert ? `[!${alert}]\n${body}` : body).split('\n')
  return lines.map((line) => (line ? `> ${line}` : '>')).join('\n')
}

function toTable(table: Element): string {
  const rows = Array.from(table.querySelectorAll('tr')).filter((row) => !isSkipped(row))
  if (rows.length === 0) return ''
  const cells = rows.map((row) =>
    Array.from(row.children)
      .filter((cell) => !isSkipped(cell))
      .map((cell) => toInlineContent(cell).trim().replace(/\|/g, '\\|').replace(/\n+/g, ' ')),
  )
  const columns = Math.max(...cells.map((row) => row.length))
  const line = (row: string[]) => `| ${Array.from({ length: columns }, (_, i) => row[i] ?? '').join(' | ')} |`
  const [head, ...body] = cells
  return [line(head!), line(Array(columns).fill('---')), ...body.map(line)].join('\n')
}

// Inline content: text, code, links, emphasis
function toInlineContent(parent: Element): string {
  let markdown = ''
  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) markdown += collapseWhitespace(node.textContent ?? '')
    else if (node instanceof Element && !isSkipped(node)) markdown += toInline(node)
  })
  return markdown
}

function toInline(element: Element): string {
  const tag = element.tagName.toUpperCase()
  if (tag === 'BR') return '\n'
  if (tag === 'CODE') {
    const text = element.textContent ?? ''
    const fence = '`'.repeat(longestRun(text, '`') + 1)
    return fence.length > 1 || text.startsWith('`') ? `${fence} ${text} ${fence}` : `${fence}${text}${fence}`
  }
  if (tag === 'IMG') {
    const src = element.getAttribute('src')
    const alt = element.getAttribute('alt') ?? ''
    // An icon without a text alternative is decoration
    const rect = element.getBoundingClientRect()
    if (!src || (!alt && rect.width <= 40 && rect.height <= 40)) return ''
    return `![${alt}](${toAbsoluteUrl(src)})`
  }
  const text = toInlineContent(element)
  if (tag === 'A') {
    const href = element.getAttribute('href')
    if (!href) return text
    const url = toAbsoluteUrl(href)
    const label = text.trim() || url
    return `[${label}](${url})`
  }
  if (!text.trim()) return text
  if (tag === 'STRONG' || tag === 'B') return wrap(text, '**')
  if (tag === 'EM' || tag === 'I') return wrap(text, '*')
  if (tag === 'DEL' || tag === 'S') return wrap(text, '~~')
  return text
}

// `**text** ` rather than `** text**` (which isn't bold)
function wrap(text: string, marker: string) {
  const [, before, inner, after] = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!
  return `${before}${marker}${inner}${marker}${after}`
}

function toAbsoluteUrl(url: string) {
  try {
    return new URL(url, window.location.href).href
  } catch {
    return url
  }
}

function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, ' ')
}

function longestRun(text: string, character: string) {
  let longest = 0
  let current = 0
  for (const c of text) {
    current = c === character ? current + 1 : 0
    longest = Math.max(longest, current)
  }
  return longest
}
