export { Link }

import React from 'react'
import { isRepoLink, RepoLink } from './RepoLink'
import { getHeadings, parseTitle, Heading, HeadingDetached } from '../headings'
import { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, assertUsage, determineSectionTitle, determineSectionUrlHash } from '../utils/server'

function Link(props: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
}) {
  if (isRepoLink(props.href)) {
    return <RepoLink path={props.href} text={props.text} />
  } else {
    return <DocLink {...props} />
  }
}

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
    assert(hrefWithoutHash || urlHash)
  }

  let heading: Heading | HeadingDetached
  let linkIsOnSamePage: boolean
  if (hrefWithoutHash) {
    heading = findHeading(hrefWithoutHash, pageContext)
    linkIsOnSamePage = heading.url === pageContext.urlPathname
  } else {
    assert(urlHash)
    linkIsOnSamePage = true
    heading = pageContext.activeHeading
  }
  assert(heading)
  assert(heading === pageContext.activeHeading || !linkIsOnSamePage)

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
      sectionTitle = determineSectionTitle(href, pageContext.config.titleNormalCase)
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
