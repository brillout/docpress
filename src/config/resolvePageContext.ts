import { assert, jsxToTextContent, objectAssign } from '../utils/server'
import { getHeadingsWithProcessedTitle, parseTitle } from '../parseTitle'
import type { Heading, HeadingDetached } from '../parseTitle'
import type { PageContextBuiltIn } from 'vite-plugin-ssr/types'
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
  const processed = getHeadingsWithProcessedTitle(config)
  const { headingsDetachedProcessed } = processed
  let { headingsProcessed } = processed
  const { activeHeading, activeNavigationHeading } = findHeading(headingsProcessed, headingsDetachedProcessed, pageContext)
  let headingsOfDetachedPage: null | (Heading | HeadingDetached)[] = null
  let headingsAll = [...headingsProcessed, ...headingsDetachedProcessed]
  headingsAll = getHeadingsWithSubHeadings(headingsAll, pageContext, activeHeading)
  if (activeNavigationHeading) {
    headingsProcessed = getHeadingsWithSubHeadings(headingsProcessed, pageContext, activeNavigationHeading)
  } else {
    headingsOfDetachedPage = [activeHeading, ...getPageHeadings(pageContext, activeHeading)]
  }
  const { title, isLandingPage, pageTitle } = getMetaData(
    headingsDetachedProcessed,
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
    headingsAll,
    headingsProcessed,
    headingsDetachedProcessed,
    headingsOfDetachedPage,
    isLandingPage,
    pageTitle,
    config
  })
  return pageContextResolved
}

function getMetaData(
  headingsDetachedProcessed: HeadingDetached[],
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
    pageTitle = headingsDetachedProcessed.find((h) => h.url === url)!.title
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
  headingsProcessed: Heading[],
  headingsDetachedProcessed: HeadingDetached[],
  pageContext: { urlOriginal: string; exports: Exports }
): { activeHeading: Heading | HeadingDetached; activeNavigationHeading: Heading | null } {
  let activeNavigationHeading: Heading | null = null
  let activeHeading: Heading | HeadingDetached | null = null
  assert(pageContext.urlOriginal)
  const pageUrl = pageContext.urlOriginal
  headingsProcessed.forEach((heading) => {
    if (heading.url === pageUrl) {
      activeNavigationHeading = heading
      activeHeading = heading
      assert(heading.level === 2, { pageUrl, heading })
    }
  })
  if (!activeHeading) {
    activeHeading = headingsDetachedProcessed.find(({ url }) => pageUrl === url) ?? null
  }
  if (!activeHeading) {
    throw new Error(
      [
        `Heading not found for URL '${pageUrl}'`,
        'Heading is defined for following URLs:',
        ...headingsProcessed
          .map((h) => `  ${h.url}`)
          .filter(Boolean)
          .sort()
      ].join('\n')
    )
  }
  return { activeHeading, activeNavigationHeading }
}

function getHeadingsWithSubHeadings<T extends Heading | HeadingDetached>(
  headingsProcessed: T[],
  pageContext: { exports: Exports; urlOriginal: string },
  activeHeading: T
): T[] {
  const headingsProcessedWithSubHeadings = headingsProcessed.slice()

  const pageHeadings = getPageHeadings(pageContext, activeHeading)

  const activeHeadingIdx = headingsProcessedWithSubHeadings.indexOf(activeHeading)
  assert(activeHeadingIdx >= 0)
  pageHeadings.forEach((pageHeading, i) => {
    headingsProcessedWithSubHeadings.splice(activeHeadingIdx + 1 + i, 0, pageHeading as T)
  })

  return headingsProcessedWithSubHeadings
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
