import React from 'react'
import { getHeadings, parseTitle, Heading, HeadingWithoutLink } from '../headings'
import { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, determineSectionTitle, determineSectionUrlHash } from '../utils'

export { DocLink }

function DocLink({
  href,
  text,
  noBreadcrumb,
  doNotInferSectionTitle
}: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
}) {
  const pageContext = usePageContext()
  return <a href={href}>{text || getTitle({ href, noBreadcrumb, pageContext, doNotInferSectionTitle })}</a>
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
  }
  const heading = findHeading(hrefWithoutHash, pageContext)

  const breadcrumbs: (string | JSX.Element)[] = []

  if ('parentHeadings' in heading) {
    breadcrumbs.push(
      ...heading.parentHeadings
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
      assert(!doNotInferSectionTitle, { doNotInferSectionTitle, href })
      sectionTitle = determineSectionTitle(href, pageContext.config.titleNormalCase)
    }
    breadcrumbs.push(sectionTitle)
  }

  {
    const linkIsOnSamePage = heading.url === pageContext.urlPathname
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

function findHeading(href: string, pageContext: PageContextResolved): Heading | HeadingWithoutLink {
  assert(href.startsWith('/'), `\`href==='${href}'\` but should start with \`/\`.`)
  const { headings, headingsWithoutLink } = getHeadings(pageContext.config)
  {
    const heading = headingsWithoutLink.find(({ url }) => href === url)
    if (heading) {
      return heading
    }
  }
  const heading = headings.find(({ url }) => href === url)
  assert(heading, `Could not find page \`${href}\`. Does it exist?`)
  return heading
}
