export { lint }
// For ./lint.spec.ts
export { lintDocs }

// `$ docpress lint` — static docs quality gate: runs without building nor starting a server.
//
// Checks all MDX files (pages `+Page.mdx` and reusable `*.mdx` components):
//   1. Anchor integrity — every internal `#anchor` link resolves to a heading.
//   2. Page integrity — every internal link with an `#anchor` (and every absolute link) points to a page.
//   3. Link convention — internal links use <Link>, not bare markdown links and not absolute
//      URLs `${config.url}/...` (that's the docs website itself, so such link is an internal
//      link in disguise — it must be a relative <Link>).
//
// Package & repository READMEs (README.md, packages/*/README.md) are plain Markdown rendered on
// npm/GitHub: they can't use <Link> and legitimately link to the docs via absolute URLs. These
// absolute links are still resolved, so that a deep link can't silently rot (e.g. a link to
// /scaling while the page lives at /stream/scale).
//
// Run it at the docs root (the directory containing `+docpress.tsx`).

import fs from 'node:fs'
import path from 'node:path'
import pc from '@brillout/picocolors'
import { extractPageSections } from '../parsePageSections.js'

type Page = {
  /** `null` if the page isn't written in MDX (we then don't know its anchors) */
  anchors: Set<string> | null
}
type Source = {
  filePath: string
  /** `null` for reusable MDX components and READMEs */
  url: string | null
  kind: 'mdx' | 'markdown'
  code: string
}
type SourceLink = {
  target: string
  index: number
  syntax: 'href' | 'markdown'
}

function lint() {
  const root = process.cwd()
  const { errors, stats } = lintDocs(root)
  if (errors.length > 0) {
    console.error(pc.red(pc.bold(`\n✗ docpress lint: ${errors.length} issue(s)\n`)))
    errors.forEach((err) => console.error('  ' + err))
    console.error('')
    process.exit(1)
  }
  const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`
  console.log(
    pc.green(
      `✓ docpress lint: ${count(stats.pages, 'page')}, ${count(stats.components, 'MDX component')}, ${count(stats.readmes, 'README')} — ` +
        `internal links (anchors, pages, and absolute ${stats.docsUrl} URLs) all resolve.`,
    ),
  )
}

function lintDocs(root: string) {
  const files = crawl(root)

  const docsUrl = getDocsUrl(root, files)
  const selfOrigin = getSelfOriginRegExp(docsUrl)

  const errors: string[] = []

  const pages = new Map<string, Page>()
  const sources: Source[] = []
  const routes = getRouteStrings(files)
  for (const filePath of files) {
    const fileName = path.basename(filePath)
    if (!fileName.startsWith('+Page.')) continue
    const dir = path.dirname(filePath)
    const url = routes.has(dir) ? (routes.get(dir) as string | null) : getFilesystemRoute(path.relative(root, dir))
    if (url === null) continue
    if (fileName !== '+Page.mdx') {
      pages.set(url, { anchors: null })
      continue
    }
    const code = fs.readFileSync(filePath, 'utf8')
    sources.push({ filePath, url, kind: 'mdx', code })
    const anchors = new Set<string>()
    try {
      // The exact same logic DocPress uses to determine the `id` of headings
      extractPageSections(code).pageSections.forEach(({ pageSectionId }) => {
        if (pageSectionId) anchors.add(pageSectionId)
      })
    } catch (err) {
      errors.push(`${getLocation(root, filePath)}: couldn't parse headings — ${(err as Error).message}`)
    }
    // Elements with an explicit `id`, e.g. <h3 id="some-id">
    for (const match of stripCode(code).matchAll(/<[a-zA-Z][^<>]*?\sid=(["'])(.+?)\1/g)) anchors.add(match[2]!)
    pages.set(url, { anchors })
  }
  const pagesCount = sources.length

  // Reusable components (`*.mdx` files other than `+Page.mdx`) get embedded into pages, so the same
  // link convention applies. They don't have a URL of their own, so page-relative `#anchor` links
  // can't be resolved and are skipped — only explicit cross-page anchors are checked.
  files
    .filter((filePath) => filePath.endsWith('.mdx') && path.basename(filePath) !== '+Page.mdx')
    .forEach((filePath) => sources.push({ filePath, url: null, kind: 'mdx', code: fs.readFileSync(filePath, 'utf8') }))
  const componentsCount = sources.length - pagesCount

  // Package & repo READMEs are plain Markdown (npm/GitHub), so the <Link> convention can't apply —
  // but their absolute links to the docs are still resolved (page + anchor) so a deep link can't
  // silently break. Listed explicitly to stay out of node_modules/
  const readmes = getReadmes(root)
  readmes.forEach((filePath) =>
    sources.push({ filePath, url: null, kind: 'markdown', code: fs.readFileSync(filePath, 'utf8') }),
  )

  for (const source of sources) {
    const { url, kind, filePath } = source
    const prose = stripCode(source.code)
    const links: SourceLink[] = []
    // JSX/HTML href="..."
    for (const match of prose.matchAll(/\bhref=(["'])(.*?)\1/g)) {
      links.push({ target: match[2]!, index: match.index, syntax: 'href' })
    }
    // Markdown [text](target) — images ![alt](src) are skipped
    for (const match of prose.matchAll(/(!?)\[(?:[^[\]]|\[[^[\]]*\])*\]\(([^)\s]+)\)/g)) {
      if (match[1]) continue
      links.push({ target: match[2]!, index: match.index, syntax: 'markdown' })
    }
    links.sort((l1, l2) => l1.index - l2.index)

    for (const { target, index, syntax } of links) {
      const link = parseInternalLink(target, selfOrigin)
      if (!link) continue // External link — not ours to check
      const { href: internal, isAbsolute, pathname, anchor } = link
      const location = getLocation(root, filePath, source.code, index)
      // `null` if it's a page-relative anchor ("#some-anchor") in a URL-less source (component / README)
      const targetUrl = pathname === '' ? url : pathname
      // A static asset, e.g. /llms.txt => public/llms.txt
      const isAsset = !anchor && targetUrl !== null && !pages.has(targetUrl) && isPublicFile(root, targetUrl)

      // Link convention (MDX only — READMEs are plain Markdown and can't use <Link>): internal links
      // must use <Link>, never a bare markdown link nor an absolute URL. (Static assets aren't pages,
      // thus can't use <Link>, but they should still use relative URLs.)
      if (kind === 'mdx') {
        if (syntax === 'markdown' && !isAsset) {
          errors.push(
            `${location}: bare markdown internal link "](${target})" — use <Link href="${internal}" /> instead`,
          )
        } else if (isAbsolute) {
          const [linkActual, linkFixed] =
            syntax === 'markdown' ? [`"](${target})"`, `"](${internal})"`] : [`href="${target}"`, `href="${internal}"`]
          errors.push(`${location}: absolute internal link ${linkActual} — use a relative ${linkFixed} instead`)
        }
      }

      // Page + anchor integrity. Relative links are resolved only if they carry an `#anchor` (a link
      // to a page without anchor is validated by <Link> at build-time, and may point to a redirect).
      // Absolute links are always resolved, page existence included.
      //
      // Relative links ("/page", "#anchor") are docs-relative only in MDX — in plain-Markdown READMEs
      // they're relative to the repository (GitHub), so there only absolute links are ours.
      if (!isAbsolute && kind !== 'mdx') continue
      if (!isAbsolute && !anchor) continue
      if (targetUrl === null || isAsset) continue
      const page = pages.get(targetUrl)
      if (!page) {
        if (targetUrl === '/') continue // Docs home — nothing to resolve
        errors.push(`${location}: link to unknown page "${target}" (there isn't any page with URL ${targetUrl})`)
      } else if (anchor && page.anchors && !page.anchors.has(anchor)) {
        errors.push(`${location}: broken anchor "${target}" — no heading "#${anchor}" on ${targetUrl}`)
      }
    }
  }

  const stats = { docsUrl, pages: pagesCount, components: componentsCount, readmes: readmes.length }
  return { errors, stats }
}

/** All files of the docs, except of `node_modules/`, `dist/`, and hidden files/directories */
function crawl(dir: string): string[] {
  const files: string[] = []
  fs.readdirSync(dir, { withFileTypes: true })
    .sort((e1, e2) => (e1.name < e2.name ? -1 : 1))
    .forEach((entry) => {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') return
      const filePath = path.join(dir, entry.name)
      if (entry.isDirectory()) files.push(...crawl(filePath))
      else if (entry.isFile()) files.push(filePath)
    })
  return files
}

function getDocsUrl(root: string, files: string[]): string {
  const configFile = files.find((filePath) => /^\+docpress\.[cm]?[jt]sx?$/.test(path.basename(filePath)))
  if (!configFile) throw new Error(`[docpress lint] No +docpress.tsx file found at ${root}`)
  const code = fs.readFileSync(configFile, 'utf8')
  // The protocol is optional, but the hostname has at least one dot (to skip `url: '/some-page'`)
  const docsUrl = /\burl:\s*(['"`])((?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+(?:[/?#][^'"`\s]*)?)\1/.exec(code)?.[2]
  if (!docsUrl) {
    throw new Error(
      `[docpress lint] Couldn't find the docs URL: ${configFile} should define it as a string literal, e.g. url: 'https://example.org'`,
    )
  }
  return docsUrl.includes('://') ? docsUrl : `https://${docsUrl}`
}

/**
 * The docs website itself: an absolute link to it is an internal link in disguise. Recognize the common spellings
 * of the origin (with/without www, http/https).
 */
function getSelfOriginRegExp(docsUrl: string): RegExp {
  const hostname = new URL(docsUrl).hostname.replace(/^www\./, '')
  const hostnameEscaped = hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^https?://(www\\.)?${hostnameEscaped}(?=[/?#]|$)`, 'i')
}

/** Pages with a Route String defined by a `+route.js` file, e.g. `export default '/pageContext.json'` */
function getRouteStrings(files: string[]) {
  const routes = new Map<string, string | null>()
  files
    .filter((filePath) => /^\+route\.[cm]?[jt]s$/.test(path.basename(filePath)))
    .forEach((filePath) => {
      const code = fs.readFileSync(filePath, 'utf8')
      const routeString = /export\s+default\s+(['"`])(\/[^'"`]*)\1/.exec(code)?.[2]
      // Route Functions and parameterized Route Strings can't be resolved statically
      const isStatic = routeString && !routeString.includes('@') && !routeString.includes('*')
      routes.set(path.dirname(filePath), isStatic ? routeString : null)
    })
  return routes
}

/** Same as Vike's Filesystem Routing, e.g. `pages/some-page/` => `/some-page` and `pages/index/` => `/` */
function getFilesystemRoute(dirRelative: string): string {
  const segments = dirRelative
    .split(path.sep)
    .filter(
      (dir) =>
        dir !== '' &&
        !['renderer', 'pages', 'src', 'index'].includes(dir) &&
        !(dir.startsWith('(') && dir.endsWith(')')),
    )
  return '/' + segments.join('/')
}

function getReadmes(root: string): string[] {
  const repoRoot = findRepositoryRoot(root)
  const readmes = [path.join(root, 'README.md')]
  if (repoRoot) {
    readmes.unshift(path.join(repoRoot, 'README.md'))
    const packagesDir = path.join(repoRoot, 'packages')
    if (fs.existsSync(packagesDir)) {
      fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .sort((e1, e2) => (e1.name < e2.name ? -1 : 1))
        .forEach((entry) => readmes.push(path.join(packagesDir, entry.name, 'README.md')))
    }
  }
  return Array.from(new Set(readmes)).filter((filePath) => fs.existsSync(filePath))
}

function findRepositoryRoot(dir: string): string | null {
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    const parentDir = path.dirname(dir)
    if (parentDir === dir) return null
    dir = parentDir
  }
}

function isPublicFile(root: string, url: string): boolean {
  let filePath: string
  try {
    filePath = path.join(root, 'public', decodeURI(url))
  } catch {
    return false
  }
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
}

/**
 * `https://vike.dev/some-page/?query#some-anchor` => `{ href: '/some-page/?query#some-anchor', isAbsolute: true, pathname: '/some-page', anchor: 'some-anchor' }`
 *
 * Returns `null` for external links.
 */
function parseInternalLink(target: string, selfOrigin: RegExp) {
  const isAbsolute = selfOrigin.test(target)
  // Relative link: "/some-page" or "#some-anchor" (but not "//cdn.example.com/some-file.js")
  if (!isAbsolute && !/^(#|\/(?!\/))/.test(target)) return null
  const href = isAbsolute ? target.replace(selfOrigin, '').replace(/^(?!\/)/, '/') : target
  const [pathAndQuery, ...hashParts] = href.split('#')
  // Text fragments, e.g. #some-anchor:~:text=some%20text
  const anchor = hashParts.join('#').split(':~:')[0]!
  let pathname = pathAndQuery!.split('?')[0]!
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
  return { href, isAbsolute, pathname, anchor }
}

/**
 * Blank out code blocks, code spans, and comments, so that the examples they contain aren't linted.
 * Offsets are preserved (only non-newline characters are replaced with spaces).
 */
function stripCode(code: string): string {
  let fence: string | null = null
  code = code
    .split('\n')
    .map((line) => {
      // Fences can be indented (e.g. inside a list item) or inside a blockquote
      const lineContent = line.replace(/^[\s>]*/, '').trimEnd()
      const fenceMatch = /^(`{3,}|~{3,})/.exec(lineContent)?.[1]
      if (fence) {
        // Closing fence: same character, at least as long as the opening fence, and nothing else
        if (
          fenceMatch &&
          fenceMatch[0] === fence[0] &&
          fenceMatch.length >= fence.length &&
          lineContent === fenceMatch
        ) {
          fence = null
        }
        return blank(line)
      }
      if (fenceMatch) {
        fence = fenceMatch
        return blank(line)
      }
      return line
    })
    .join('\n')
  return (
    code
      // Code spans, e.g. `<Link href="#some-anchor" />` and ``some `code` span``
      .replace(/(?<!`)(`+)(?!`).+?(?<!`)\1(?!`)/g, blank)
      // MDX comments {/* ... */} and HTML comments <!-- ... -->
      .replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g, blank)
  )
}
function blank(str: string): string {
  return str.replace(/[^\n]/g, ' ')
}

function getLocation(root: string, filePath: string, code?: string, index?: number): string {
  let location = path.relative(root, filePath).split(path.sep).join('/')
  if (code !== undefined && index !== undefined) location += ':' + code.slice(0, index).split('\n').length
  return location
}
