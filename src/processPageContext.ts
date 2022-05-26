import { assert, jsxToTextContent, objectAssign } from './utils'
import { getHeadings, HeadingWithoutLink, parseTitle } from './headings'
import type { Heading } from './headings'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { MarkdownHeading } from './vite.config/markdownHeadings'
import type { Config } from './Config'

export { processPageContext }
export type { PageContextOriginal }
export type { PageContextAdded }
export type { Heading }

type ReactComponent = () => JSX.Element
type PageExports = {
  headings?: MarkdownHeading[]
}
type PageContextOriginal = PageContextBuiltIn & {
  Page: ReactComponent
  pageExports: PageExports
  exports: {
    config: Config
  }
}
type PageContextAdded = ReturnType<typeof processPageContext>

function processPageContext(pageContext: PageContextOriginal) {
  const { headings, headingsWithoutLink } = getHeadings(pageContext)
  const activeHeading = findActiveHeading(headings, headingsWithoutLink, pageContext)
  const headingsWithSubHeadings = getHeadingsWithSubHeadings(headings, pageContext, activeHeading)
  const { title, isLandingPage, pageTitle, isDetachedPage } = getMetaData(
    headingsWithoutLink,
    activeHeading,
    pageContext
  )
  const { faviconUrl, algolia, tagline } = pageContext.exports.config
  const pageContextAdded = {}
  objectAssign(pageContextAdded, {
    meta: {
      title,
      faviconUrl,
      tagline,
      algolia
    },
    headings,
    headingsWithSubHeadings,
    isLandingPage,
    isDetachedPage,
    pageTitle
  })
  return pageContextAdded
}

function getMetaData(
  headingsWithoutLink: HeadingWithoutLink[],
  activeHeading: Heading | null,
  pageContext: { url: string; pageExports: PageExports; exports: { config: Config } }
) {
  const { url } = pageContext

  let title: string
  let pageTitle: string | JSX.Element | null
  let isDetachedPage: boolean
  if (activeHeading) {
    title = activeHeading.titleDocument || jsxToTextContent(activeHeading.title)
    pageTitle = activeHeading.title
    isDetachedPage = false
  } else {
    pageTitle = headingsWithoutLink.find((h) => h.url === url)!.title
    title = jsxToTextContent(pageTitle)
    isDetachedPage = true
  }

  const isLandingPage = url === '/'
  if (!isLandingPage) {
    title += ' | ' + pageContext.exports.config.projectInfo.projectName
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { title, isLandingPage, pageTitle, isDetachedPage }
}

function findActiveHeading(
  headings: Heading[],
  headingsWithoutLink: HeadingWithoutLink[],
  pageContext: { url: string; pageExports: PageExports }
): Heading | null {
  let activeHeading: Heading | null = null
  assert(pageContext.url)
  const pageUrl = pageContext.url
  headings.forEach((heading) => {
    if (heading.url === pageUrl) {
      activeHeading = heading
      assert(heading.level === 2, { pageUrl, heading })
    }
  })
  const debugInfo = {
    msg: 'Heading not found for url: ' + pageUrl,
    urls: headings.map((h) => h.url),
    url: pageUrl
  }
  assert(activeHeading || headingsWithoutLink.find(({ url }) => pageUrl === url), debugInfo)
  return activeHeading
}

function getHeadingsWithSubHeadings(
  headings: Heading[],
  pageContext: { pageExports: PageExports; url: string },
  activeHeading: Heading | null
): Heading[] {
  const headingsWithSubHeadings = headings.slice()
  if (activeHeading === null) return headingsWithSubHeadings
  const activeHeadingIdx = headingsWithSubHeadings.indexOf(activeHeading)
  assert(activeHeadingIdx >= 0)
  const pageHeadings = pageContext.pageExports.headings || []
  pageHeadings.forEach((pageHeading, i) => {
    const title = parseTitle(pageHeading.title)
    const url = '#' + pageHeading.id
    assert(
      pageHeading.headingLevel !== 3,
      'Wrong page heading level `' +
        pageHeading.headingLevel +
        '` (it should be `<h2>`) for sub-heading `' +
        pageHeading.title +
        '` of page `' +
        pageContext.url +
        '`.'
    )
    if (pageHeading.headingLevel === 2) {
      const heading: Heading = {
        url,
        title,
        parentHeadings: [activeHeading, ...activeHeading.parentHeadings],
        titleInNav: title,
        level: 3
      }
      headingsWithSubHeadings.splice(activeHeadingIdx + 1 + i, 0, heading)
    }
  })

  if (activeHeading?.sectionTitles) {
    activeHeading.sectionTitles.forEach((sectionTitle) => {
      const pageHeadingTitles = pageHeadings.map((h) => h.title)
      assert(pageHeadingTitles.includes(sectionTitle), { pageHeadingTitles, sectionTitle })
    })
  }

  return headingsWithSubHeadings
}
