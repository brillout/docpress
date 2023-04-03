import { assert, jsxToTextContent, objectAssign } from '../utils/server'
import { getHeadings, parseTitle } from '../headings'
import type { Heading, HeadingDetached } from '../headings'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { MarkdownHeading } from '../markdownHeadingsVitePlugin'
import type { Config } from './Config'
import { getConfig } from './getConfig'

export { resolvePageContext }
export type { PageContextOriginal }
export type { PageContextResolved }
export type { Heading }

type ReactComponent = () => JSX.Element
type Exports = {
  headings?: MarkdownHeading[]
}
type PageContextOriginal = PageContextBuiltIn & {
  Page: ReactComponent
  exports: Exports
}
type PageContextResolved = ReturnType<typeof resolvePageContext>

function resolvePageContext(pageContext: PageContextOriginal) {
  const config = getConfig()
  const { headings, headingsDetached } = getHeadings(config)
  const { activeHeading, activeNavigationHeading } = findHeading(headings, headingsDetached, pageContext)
  let headingsWithSubHeadings: Heading[]
  let detachedPageHeadings: null | Heading[]
  if (activeNavigationHeading) {
    detachedPageHeadings = null
    headingsWithSubHeadings = getHeadingsWithSubHeadings(headings, pageContext, activeNavigationHeading)
  } else {
    detachedPageHeadings = getPageHeadings(pageContext, activeHeading)
    headingsWithSubHeadings = headings
  }
  const { title, isLandingPage, pageTitle } = getMetaData(
    headingsDetached,
    activeNavigationHeading,
    pageContext,
    config
  )
  const { faviconUrl, algolia, tagline, twitterHandle, bannerUrl, websiteUrl } = config
  const pageContextResolved = {}
  objectAssign(pageContextResolved, {
    ...pageContext,
    meta: {
      title,
      faviconUrl,
      twitterHandle,
      bannerUrl,
      websiteUrl,
      tagline,
      algolia
    },
    activeHeading,
    headings,
    headingsWithSubHeadings,
    detachedPageHeadings,
    isLandingPage,
    pageTitle,
    config
  })
  return pageContextResolved
}

function getMetaData(
  headingsDetached: HeadingDetached[],
  activeNavigationHeading: Heading | null,
  pageContext: { urlOriginal: string; exports: Exports },
  config: Config
) {
  const url = pageContext.urlOriginal

  let title: string
  let pageTitle: string | JSX.Element | null
  if (activeNavigationHeading) {
    title = activeNavigationHeading.titleDocument || jsxToTextContent(activeNavigationHeading.title)
    pageTitle = activeNavigationHeading.title
  } else {
    pageTitle = headingsDetached.find((h) => h.url === url)!.title
    title = jsxToTextContent(pageTitle)
  }

  const isLandingPage = url === '/'
  if (!isLandingPage) {
    title += ' | ' + config.projectInfo.projectName
  }

  if (isLandingPage) {
    pageTitle = null
  }

  return { title, isLandingPage, pageTitle }
}

function findHeading(
  headings: Heading[],
  headingsDetached: HeadingDetached[],
  pageContext: { urlOriginal: string; exports: Exports }
): { activeHeading: Heading | HeadingDetached; activeNavigationHeading: Heading | null } {
  let activeNavigationHeading: Heading | null = null
  let activeHeading: Heading | HeadingDetached | null = null
  assert(pageContext.urlOriginal)
  const pageUrl = pageContext.urlOriginal
  headings.forEach((heading) => {
    if (heading.url === pageUrl) {
      activeNavigationHeading = heading
      activeHeading = heading
      assert(heading.level === 2, { pageUrl, heading })
    }
  })
  if (!activeHeading) {
    activeHeading = headingsDetached.find(({ url }) => pageUrl === url) ?? null
  }
  const debugInfo = {
    msg: 'Heading not found for url: ' + pageUrl,
    urls: headings.map((h) => h.url),
    url: pageUrl
  }
  assert(activeHeading, debugInfo)
  return { activeHeading, activeNavigationHeading }
}

function getHeadingsWithSubHeadings(
  headings: Heading[],
  pageContext: { exports: Exports; urlOriginal: string },
  activeNavigationHeading: Heading | null
): Heading[] {
  const headingsWithSubHeadings = headings.slice()
  if (activeNavigationHeading === null) return headingsWithSubHeadings

  const pageHeadings = getPageHeadings(pageContext, activeNavigationHeading)

  const activeHeadingIdx = headingsWithSubHeadings.indexOf(activeNavigationHeading)
  assert(activeHeadingIdx >= 0)
  pageHeadings.forEach((pageHeading, i) => {
    headingsWithSubHeadings.splice(activeHeadingIdx + 1 + i, 0, pageHeading)
  })

  return headingsWithSubHeadings
}

function getPageHeadings(
  pageContext: { exports: Exports; urlOriginal: string },
  currentHeading: Heading | HeadingDetached
) {
  const pageHeadings: Heading[] = []

  const markdownHeadings = pageContext.exports.headings ?? []

  markdownHeadings.forEach((markdownHeading) => {
    const title = parseTitle(markdownHeading.title)
    const url: null | string = markdownHeading.headingId && '#' + markdownHeading.headingId
    // Remove this warning?
    if (markdownHeading.headingLevel === 3) {
      console.warn(
        'Wrong page heading level `' +
          markdownHeading.headingLevel +
          '` (it should be `<h2>`) for sub-heading `' +
          markdownHeading.title +
          '` of page `' +
          pageContext.urlOriginal +
          '`.'
      )
    }
    if (markdownHeading.headingLevel === 2) {
      const heading: Heading = {
        url,
        title,
        parentHeadings: [currentHeading, ...(currentHeading.parentHeadings ?? [])],
        titleInNav: title,
        level: 3
      }
      pageHeadings.push(heading)
    }
  })

  if (currentHeading?.sectionTitles) {
    currentHeading.sectionTitles.forEach((sectionTitle) => {
      const pageHeadingTitles = markdownHeadings.map((h) => h.title)
      assert(pageHeadingTitles.includes(sectionTitle), { pageHeadingTitles, sectionTitle })
    })
  }

  return pageHeadings
}
