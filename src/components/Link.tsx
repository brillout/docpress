export { Link }

import React from 'react'
import { isRepoLink, RepoLink } from './RepoLink'
import { getHeadings, parseTitle, Heading, HeadingDetached } from '../headings'
import { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, assertUsage, determineSectionTitle, determineSectionUrlHash } from '../utils/server'

function Link({
  href,
  text,
  noBreadcrumb,
  doNotInferSectionTitle,
  titleNormalCase
}: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
  titleNormalCase?: boolean
}) {
  if (isRepoLink(href)) {
    return <RepoLink path={href} text={text} />
  } else {
    const pageContext = usePageContext()
    return (
      <a href={href}>
        {text || getTitle({ href, noBreadcrumb, pageContext, doNotInferSectionTitle, titleNormalCase })}
      </a>
    )
  }
}

function getTitle({
  href,
  noBreadcrumb,
  pageContext,
  doNotInferSectionTitle,
  titleNormalCase
}: {
  href: string
  noBreadcrumb: true | undefined
  pageContext: PageContextResolved
  doNotInferSectionTitle: true | undefined
  titleNormalCase: boolean | undefined
}): string | JSX.Element {
  let urlHash: string | null = null
  let hrefWithoutHash: string = href
  if (href.includes('#')) {
    ;[hrefWithoutHash, urlHash] = href.split('#')
    assert(hrefWithoutHash || urlHash)
  }

  let heading: Heading | HeadingDetached
  let linkIsOnSamePage: boolean = false
  if (hrefWithoutHash) {
    heading = findHeading(hrefWithoutHash, pageContext)
    if (heading.url === pageContext.urlPathname) {
      linkIsOnSamePage = true
      // heading !== pageContext.activeHeading because activeHeading is a different object holding on-this-page subheadings
      heading = pageContext.activeHeading
    }
  } else {
    assert(urlHash)
    linkIsOnSamePage = true
    heading = pageContext.activeHeading
  }
  assert(heading)
  assert(linkIsOnSamePage === (heading.url === pageContext.urlPathname))
  assert(linkIsOnSamePage === (heading.url === pageContext.activeHeading.url))
  assert(linkIsOnSamePage === (heading === pageContext.activeHeading))

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
    if ('sectionTitles' in heading && heading.sectionTitles) {
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
      if (titleNormalCase === undefined) titleNormalCase = pageContext.config.titleNormalCase
      sectionTitle = determineSectionTitle(href, titleNormalCase)
    }
    breadcrumbs.push(sectionTitle)
  }

  {
    if (noBreadcrumb || linkIsOnSamePage) {
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
  assert(href.startsWith('/'), `\`href==='${href}'\` but should start with \`/\`.`)
  const { headings, headingsDetached } = getHeadings(pageContext.config)
  {
    const heading = headingsDetached.find(({ url }) => href === url)
    if (heading) {
      return heading
    }
  }
  const heading = headings.find(({ url }) => href === url)
  assert(heading, `Could not find page \`${href}\`. Does it exist?`)
  return heading
}
