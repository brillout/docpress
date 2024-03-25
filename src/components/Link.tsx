export { Link }
export type { LinkData }

import React from 'react'
import { isRepoLink, RepoLink } from './RepoLink'
import type { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, assertUsage, determineSectionTitle, determineSectionUrlHash } from '../utils/server'
import { parseTitle } from '../parseTitle'
import pc from '@brillout/picocolors'

function Link({
  href,
  text,
  noBreadcrumb,
  doNotInferSectionTitle,
  children,
}: {
  href: string
  text?: string | JSX.Element
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
  children?: React.ReactNode
}) {
  assertUsage(
    href.startsWith('/') || href.startsWith('#'),
    `<Link href /> prop \`href==='${href}'\` but should start with '/' or '#'`,
  )
  assertUsage(!text || !children, 'Cannot use both `text` or `children`')

  if (isRepoLink(href)) {
    return <RepoLink path={href} text={text} />
  } else {
    const pageContext = usePageContext()
    return (
      <a href={href}>{children || text || getLinkText({ href, noBreadcrumb, pageContext, doNotInferSectionTitle })}</a>
    )
  }
}

function getLinkText({
  href,
  noBreadcrumb,
  pageContext,
  doNotInferSectionTitle,
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

  let linkData: LinkData
  let isLinkOnSamePage: boolean = false
  if (hrefWithoutHash) {
    linkData = findLinkData(hrefWithoutHash, pageContext)
    if (linkData.url === pageContext.urlPathname) {
      isLinkOnSamePage = true
      // heading !== pageContext.activeHeading because activeHeading is a different object holding on-this-page subheadings
      linkData = pageContext.activeHeading
    }
  } else {
    assert(urlHash)
    isLinkOnSamePage = true
    linkData = pageContext.activeHeading
  }
  assert(linkData)
  assert(isLinkOnSamePage === (linkData.url === pageContext.urlPathname))
  assert(isLinkOnSamePage === (linkData.url === pageContext.activeHeading.url))
  assert(isLinkOnSamePage === (linkData === pageContext.activeHeading))

  const breadcrumbParts: (string | JSX.Element)[] = []

  if (linkData.linkBreadcrumb) {
    breadcrumbParts.push(...(linkData.linkBreadcrumb ?? []).slice().reverse())
  }

  breadcrumbParts.push(linkData.title)

  if (urlHash) {
    let sectionTitle: string | JSX.Element | undefined = undefined
    assert(!urlHash.startsWith('#'))
    if (isLinkOnSamePage) {
      const pageHeading = findLinkData(`#${urlHash}`, pageContext)
      sectionTitle = pageHeading.title
    } else if ('sectionTitles' in linkData && linkData.sectionTitles) {
      linkData.sectionTitles.forEach((title) => {
        if (determineSectionUrlHash(title) === urlHash) {
          sectionTitle = parseTitle(title)
        }
      })
    }
    if (!sectionTitle) {
      assertUsage(
        !doNotInferSectionTitle,
        `Page section title not found for <Link href="\`${href}\`" doNotInferSectionTitle={true} />.`,
      )
      sectionTitle = determineSectionTitle(href)
    }
    breadcrumbParts.push(sectionTitle)
  }

  {
    if (noBreadcrumb || isLinkOnSamePage) {
      return breadcrumbParts[breadcrumbParts.length - 1]
    }
  }

  return (
    <>
      {breadcrumbParts.map((title, i) => {
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

type LinkData = {
  url?: null | string
  title: JSX.Element
  linkBreadcrumb: null | JSX.Element[]
  sectionTitles?: string[]
}

function findLinkData(href: string, pageContext: PageContextResolved): LinkData {
  assert(href.startsWith('/') || href.startsWith('#'))
  const { linksData } = pageContext
  const linkData = linksData.find(({ url }) => href === url)
  if (href.startsWith('#')) {
    assertUsage(linkData, `Couldn't find ${href} in ${pageContext.urlPathname}, does it exist?`)
  } else {
    assertUsage(
      linkData,
      [
        `Couldn't find page with URL ${pc.bold(href)}`,
        `— did you define it in`,
        [
          pc.cyan('docpress.config.js'),
          pc.dim('#{'),
          pc.cyan('headings'),
          pc.dim(','),
          pc.cyan('headingsDetached'),
          pc.dim('}'),
          '?',
        ].join(''),
      ].join(' '),
    )
  }
  return linkData
}
