export { lint }

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
import { extractPageSections } from '../parsePageSections.js'

type Source = {
  /** File path relative to the docs root, e.g. `pages/some-page/+Page.mdx` */
  name: string
  code: string
  /**
   * - `page`: `+Page.mdx`
   * - `component`: reusable `*.mdx` component, embedded into pages
   * - `readme`: plain Markdown rendered on npm/GitHub
   */
  kind: 'page' | 'component' | 'readme'
  /** The page's URL — `null` for components and READMEs */
  url: string | null
}
type SourceLink = {
  target: string
  syntax: 'href' | 'markdown'
  line: number
}
type Docs = {
  root: string
  selfOrigin: RegExp
  /** The anchors of each page, by URL — `null` if the page isn't written in MDX (we then don't know its anchors) */
  pages: Map<string, Set<string> | null>
}

function lint(root: string) {
  const files = crawl(root)
  const docsUrl = getDocsUrl(files, root)
  const docs: Docs = { root, selfOrigin: getSelfOriginRegExp(docsUrl), pages: getPages(files, root) }
  const sources = getSources(files, root)
  const errors = sources.flatMap((source) => getLinks(source).flatMap((link) => lintLink(link, source, docs)))
  const count = (kind: Source['kind']) => sources.filter((source) => source.kind === kind).length
  const stats = { docsUrl, pages: count('page'), components: count('component'), readmes: count('readme') }
  return { errors, stats }
}

/** All files of the docs, except of `node_modules/`, `dist/`, and hidden files/directories */
function crawl(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist')
    .sort((e1, e2) => (e1.name < e2.name ? -1 : 1))
    .flatMap((entry) => {
      const filePath = path.join(dir, entry.name)
      if (entry.isDirectory()) return crawl(filePath)
      return entry.isFile() ? [filePath] : []
    })
}

function getDocsUrl(files: string[], root: string): string {
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

/** All pages, by URL */
function getPages(files: string[], root: string): Docs['pages'] {
  const pages: Docs['pages'] = new Map()
  for (const filePath of files) {
    if (!path.basename(filePath).startsWith('+Page.')) continue
    const url = getPageUrl(filePath, root)
    if (url === null) continue
    pages.set(url, filePath.endsWith('.mdx') ? getAnchors(fs.readFileSync(filePath, 'utf8')) : null)
  }
  return pages
}

/** The URL of a page — `null` if it can't be determined statically (Route Function or parameterized Route String) */
function getPageUrl(pageFile: string, root: string): string | null {
  const dir = path.dirname(pageFile)
  // Route String defined by a `+route.js` file, e.g. `export default '/pageContext.json'`
  const routeFile = fs.readdirSync(dir).find((fileName) => /^\+route\.[cm]?[jt]s$/.test(fileName))
  if (!routeFile) return getFilesystemRoute(path.relative(root, dir))
  const routeFileCode = fs.readFileSync(path.join(dir, routeFile), 'utf8')
  const routeString = /export\s+default\s+(['"`])(\/[^'"`]*)\1/.exec(routeFileCode)?.[2]
  return routeString && !/[@*]/.test(routeString) ? routeString : null
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

/**
 * The anchors of an MDX page: its headings (with the exact same `id` DocPress gives them) and its elements with an
 * explicit `id` (e.g. `<h3 id="some-id">`).
 */
function getAnchors(code: string): Set<string> {
  const headingIds = extractPageSections(code).pageSections.flatMap(({ pageSectionId }) => pageSectionId ?? [])
  const elementIds = Array.from(stripCode(code).matchAll(/<[a-zA-Z][^<>]*?\sid=(["'])(.+?)\1/g), (match) => match[2]!)
  return new Set([...headingIds, ...elementIds])
}

/** The files to lint: MDX pages, reusable MDX components, and READMEs */
function getSources(files: string[], root: string): Source[] {
  const source = (filePath: string, kind: Source['kind'], url: string | null = null): Source => ({
    name: path.relative(root, filePath).split(path.sep).join('/'),
    code: fs.readFileSync(filePath, 'utf8'),
    kind,
    url,
  })
  const mdxSources = files
    .filter((filePath) => filePath.endsWith('.mdx'))
    .map((filePath) =>
      path.basename(filePath) === '+Page.mdx'
        ? source(filePath, 'page', getPageUrl(filePath, root))
        : source(filePath, 'component'),
    )
  return [...mdxSources, ...getReadmes(root).map((filePath) => source(filePath, 'readme'))]
}

/** The docs, repository, and package READMEs — listed explicitly to stay out of node_modules/ */
function getReadmes(root: string): string[] {
  const readmes = [path.join(root, 'README.md')]
  const repoRoot = findRepositoryRoot(root)
  if (repoRoot) {
    const packagesDir = path.join(repoRoot, 'packages')
    const packageNames = fs.existsSync(packagesDir) ? fs.readdirSync(packagesDir).sort() : []
    readmes.push(
      path.join(repoRoot, 'README.md'),
      ...packageNames.map((name) => path.join(packagesDir, name, 'README.md')),
    )
  }
  return [...new Set(readmes)].filter((filePath) => fs.existsSync(filePath))
}

function findRepositoryRoot(dir: string): string | null {
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    const parentDir = path.dirname(dir)
    if (parentDir === dir) return null
    dir = parentDir
  }
}

/** The links of a source — except of the links inside code blocks, code spans, and comments */
function getLinks(source: Source): SourceLink[] {
  const prose = stripCode(source.code)
  const links = [
    // JSX/HTML href="..."
    ...Array.from(prose.matchAll(/\bhref=(["'])(.*?)\1/g), (match) => ({
      target: match[2]!,
      syntax: 'href' as const,
      index: match.index,
    })),
    // Markdown [text](target) — but not images ![alt](src)
    ...Array.from(prose.matchAll(/(?<!!)\[(?:[^[\]]|\[[^[\]]*\])*\]\(([^)\s]+)\)/g), (match) => ({
      target: match[1]!,
      syntax: 'markdown' as const,
      index: match.index,
    })),
  ]
  return links
    .sort((l1, l2) => l1.index - l2.index)
    .map(({ index, ...link }) => ({ ...link, line: prose.slice(0, index).split('\n').length }))
}

/**
 * Blank out code blocks, code spans, and comments, so that the examples they contain aren't linted.
 * Offsets are preserved (only non-newline characters are replaced with spaces).
 */
function stripCode(code: string): string {
  let fence: string | null = null
  const lines = code.split('\n').map((line) => {
    // Fences can be indented (e.g. inside a list item) or inside a blockquote
    const lineContent = line.replace(/^[\s>]*/, '').trimEnd()
    if (fence) {
      // Closing fence: only fence characters, at least as many as the opening fence
      if (lineContent.startsWith(fence) && /^(`+|~+)$/.test(lineContent)) fence = null
      return blank(line)
    }
    // Opening fence (the info string of a backtick fence can't contain backticks)
    fence = /^(`{3,}(?!.*`)|~{3,})/.exec(lineContent)?.[1] ?? null
    return fence ? blank(line) : line
  })
  return (
    lines
      .join('\n')
      // Code spans, e.g. `<Link href="#some-anchor" />` and ``some `code` span``
      .replace(/(?<!`)(`+)(?!`).+?(?<!`)\1(?!`)/g, blank)
      // JSX code elements, e.g. <code>{'<a href="https://example.org/some-page">'}</code>
      .replace(/<code\b[\s\S]*?<\/code>/g, blank)
      // MDX comments {/* ... */} and HTML comments <!-- ... -->
      .replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g, blank)
  )
}
function blank(str: string): string {
  return str.replace(/[^\n]/g, ' ')
}

/** Checks the link convention (MDX only), and whether the link's target page and anchor exist */
function lintLink({ target, syntax, line }: SourceLink, source: Source, docs: Docs): string[] {
  const internalLink = parseInternalLink(target, docs.selfOrigin)
  if (!internalLink) return [] // External link — not ours to check
  const { href, isAbsolute, pathname, anchor } = internalLink
  const isMdx = source.kind !== 'readme'
  // `null` if it's a page-relative anchor ("#some-anchor") of a URL-less source (component / README)
  const targetUrl = pathname || source.url
  // A static asset, e.g. /llms.txt => public/llms.txt
  const isAsset = !anchor && targetUrl !== null && !docs.pages.has(targetUrl) && isPublicFile(docs.root, targetUrl)
  const quote = (link: string) => (syntax === 'markdown' ? `"](${link})"` : `href="${link}"`)
  const errors: string[] = []

  // Link convention (MDX only — READMEs are plain Markdown and can't use <Link>): internal links use <Link>, never a
  // bare markdown link nor an absolute URL. (Static assets aren't pages, thus can't use <Link>, but they should still
  // use relative URLs.)
  if (isMdx && syntax === 'markdown' && !isAsset) {
    errors.push(`bare markdown internal link ${quote(target)} — use <Link href="${href}" /> instead`)
  } else if (isMdx && isAbsolute) {
    errors.push(`absolute internal link ${quote(target)} — use a relative ${quote(href)} instead`)
  }

  // Page + anchor integrity. Absolute links are always resolved, page existence included. Relative links are resolved
  // only in MDX (in READMEs they're relative to the repository on GitHub) and only if they carry an `#anchor`: the
  // target page of a <Link> is already validated at build-time, while an href can legitimately point to something
  // else than a page (e.g. a redirect or an asset generated at build-time).
  const isResolved = isAbsolute || (isMdx && !!anchor)
  if (isResolved && targetUrl !== null && !isAsset) {
    const anchors = docs.pages.get(targetUrl)
    if (anchors === undefined) {
      // The docs home doesn't have to be a page (e.g. it can be a redirect)
      if (targetUrl !== '/')
        errors.push(`link to unknown page "${target}" (there isn't any page with URL ${targetUrl})`)
    } else if (anchor && anchors && !anchors.has(anchor)) {
      errors.push(`broken anchor "${target}" — no heading "#${anchor}" on ${targetUrl}`)
    }
  }

  return errors.map((error) => `${source.name}:${line}: ${error}`)
}

/**
 * `https://vike.dev/some-page/?query#some-anchor` => `{ href: '/some-page/?query#some-anchor', isAbsolute: true, pathname: '/some-page', anchor: 'some-anchor' }`
 *
 * Returns `null` for external links.
 */
function parseInternalLink(target: string, selfOrigin: RegExp) {
  const isAbsolute = selfOrigin.test(target)
  // Relative link: "/some-page" or "#some-anchor" (but not "//cdn.example.com/some-file.js")
  const isRelative = /^(#|\/(?!\/))/.test(target)
  if (!isAbsolute && !isRelative) return null
  let href = target
  if (isAbsolute) {
    // E.g. `https://vike.dev` => `/` and `https://vike.dev#some-anchor` => `/#some-anchor`
    href = target.replace(selfOrigin, '')
    if (!href.startsWith('/')) href = `/${href}`
  }
  const [pathAndQuery, ...hashParts] = href.split('#')
  // Text fragments, e.g. #some-anchor:~:text=some%20text
  const anchor = hashParts.join('#').split(':~:')[0]!
  let pathname = pathAndQuery!.split('?')[0]!
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
  return { href, isAbsolute, pathname, anchor }
}

function isPublicFile(root: string, url: string): boolean {
  const filePath = path.join(root, 'public', url)
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
}
