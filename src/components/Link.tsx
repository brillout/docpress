export { Link }

import React from 'react'
import { isRepoLink, RepoLink } from './RepoLink'
import type { Heading, HeadingDetached } from '../types/Heading'
import type { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, assertUsage, determineSectionTitle, determineSectionUrlHash } from '../utils/server'
import { parseTitle } from '../parseTitle'

function Link({
  href,
  text,
  noBreadcrumb,
  doNotInferSectionTitle,
  children
}: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
  children?: React.ReactNode
}) {
  assertUsage(
    href.startsWith('/') || href.startsWith('#'),
    `<Link href /> prop \`href==='${href}'\` but should start with '/' or '#'`
  )
  assertUsage(!text || !children, 'Cannot use both `text` or `children`')

  if (isRepoLink(href)) {
    return <RepoLink path={href} text={text} />
  } else {
    const pageContext = usePageContext()
    return (
      <a href={href}>{children || text || getTitle({ href, noBreadcrumb, pageContext, doNotInferSectionTitle })}</a>
    )
  }
}

function getTitle({
  href,
  noBreadcrumb,
  pageContext,
  doNotInferSectionTitle
}: {
  href: string
  noBreadcrumb: true | undefined
  pageContext: PageContextResolved
  doNotInferSectionTitle: true | undefined
}): string | JSX.Element {
  let urlHash: string | null = null
  let hrefWithoutHash: string = href
  if (href.includes('#')) {
    ;[hrefWithoutHash, urlHash] = href.split('#')
    assert(hrefWithoutHash || urlHash)
  }

  let heading: Heading | HeadingDetached
  let isLinkOnSamePage: boolean = false
  if (hrefWithoutHash) {
    heading = findHeading(hrefWithoutHash, pageContext)
    if (heading.url === pageContext.urlPathname) {
      isLinkOnSamePage = true
      // heading !== pageContext.activeHeading because activeHeading is a different object holding on-this-page subheadings
      heading = pageContext.activeHeading
    }
  } else {
    assert(urlHash)
    isLinkOnSamePage = true
    heading = pageContext.activeHeading
  }
  assert(heading)
  assert(isLinkOnSamePage === (heading.url === pageContext.urlPathname))
  assert(isLinkOnSamePage === (heading.url === pageContext.activeHeading.url))
  assert(isLinkOnSamePage === (heading === pageContext.activeHeading))

  const breadcrumbs: (string | JSX.Element)[] = []

  if (heading.parentHeadings) {
    breadcrumbs.push(
      ...(heading.parentHeadings ?? [])
        .slice()
        .reverse()
        .map(({ title }) => title)
    )
  }

  breadcrumbs.push(heading.title)

  if (urlHash) {
    let sectionTitle: string | JSX.Element | undefined = undefined
    assert(!urlHash.startsWith('#'))
    if (isLinkOnSamePage) {
      const pageHeading = findHeading(`#${urlHash}`, pageContext)
      sectionTitle = pageHeading.title
    } else if ('sectionTitles' in heading && heading.sectionTitles) {
      heading.sectionTitles.forEach((title) => {
        if (determineSectionUrlHash(title) === urlHash) {
          sectionTitle = parseTitle(title)
        }
      })
    }
    if (!sectionTitle) {
      assertUsage(
        !doNotInferSectionTitle,
        `Page section title not found for <Link href="\`${href}\`" doNotInferSectionTitle={true} />.`
      )
      sectionTitle = determineSectionTitle(href)
    }
    breadcrumbs.push(sectionTitle)
  }

  {
    if (noBreadcrumb || isLinkOnSamePage) {
      return breadcrumbs[breadcrumbs.length - 1]
    }
  }

  return (
    <>
      {breadcrumbs.map((title, i) => {
        const seperator = i === 0 ? <></> : ' > '
        return (
          <React.Fragment key={i}>
            {seperator}
            {title}
          </React.Fragment>
        )
      })}
    </>
  )
}

function findHeading(href: string, pageContext: PageContextResolved): Heading | HeadingDetached {
  assert(href.startsWith('/') || href.startsWith('#'))
  const { headingsAll } = pageContext
  const heading = headingsAll.find(({ url }) => href === url)
  if (href.startsWith('#')) {
    assertUsage(heading, `Couldn't find ${href} in ${pageContext.urlPathname}, does it exist?`)
  } else {
    assertUsage(heading, `Couldn't find heading for ${href}, did you define the heading for ${href}?`)
  }
  return heading
}
