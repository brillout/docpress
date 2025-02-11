export { Link }
export type { LinkData }

import React from 'react'
import type { PageContextResolved } from '../config/resolvePageContext'
import { usePageContext } from '../renderer/usePageContext'
import { assert, assertUsage, assertWarning, determineSectionTitle, determineSectionUrlHash } from '../utils/server'
import { parseMarkdownMini } from '../parseMarkdownMini'
import pc from '@brillout/picocolors'

function Link({
  href,
  text,
  noBreadcrumb,
  doNotInferSectionTitle,
  children,
}: {
  href: string
  text?: string | React.ReactNode
  noBreadcrumb?: true
  doNotInferSectionTitle?: true
  children?: React.ReactNode
}) {
  const pageContext = usePageContext()
  assertUsage(
    href.startsWith('/') || href.startsWith('#'),
    `<Link href /> prop \`href==='${href}'\` but should start with '/' or '#'`,
  )
  assertUsage(!text || !children, 'Cannot use both `text` or `children`')
  // assertWarning(!text, 'prop `text` is deprecated')
  text = text ?? children

    const linkTextData = getLinkTextData(href, pageContext, doNotInferSectionTitle)
    if (!linkTextData) {
      text = 'LINK-TARGET-NOT-FOUND'
    } else if (!text) {
      text = getLinkText({
        noBreadcrumb,
        ...linkTextData,
      })
    }
    return <a href={href}>{text}</a>
}

function getLinkText({
  noBreadcrumb,
  linkData,
  sectionTitle,
  isLinkOnSamePage,
}: {
  noBreadcrumb: true | undefined
  linkData: LinkData
  sectionTitle: React.JSX.Element | null
  isLinkOnSamePage: boolean
}): React.JSX.Element {
  const breadcrumbParts: React.JSX.Element[] = []
  if (linkData.linkBreadcrumb) {
    breadcrumbParts.push(...(linkData.linkBreadcrumb ?? []).slice().reverse().map(parseMarkdownMini))
  }
  breadcrumbParts.push(parseMarkdownMini(linkData.title))
  if (sectionTitle) breadcrumbParts.push(sectionTitle)

  if (noBreadcrumb || isLinkOnSamePage) {
    return breadcrumbParts[breadcrumbParts.length - 1]
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

function getLinkTextData(href: string, pageContext: PageContextResolved, doNotInferSectionTitle?: boolean) {
  const { hrefPathname, hrefHash } = parseHref(href)

  const linkData = findLinkData(hrefPathname || pageContext.urlPathname, pageContext)
  assert(linkData)
  const isLinkOnSamePage = linkData.url === pageContext.urlPathname
  if (!hrefPathname) assert(isLinkOnSamePage)

  let sectionTitle: React.JSX.Element | null = null
  if (hrefHash) {
    assert(!hrefHash.startsWith('#'))
    if (isLinkOnSamePage) {
      const linkDataPageSection = findLinkData(`#${hrefHash}`, pageContext)
      if (!linkDataPageSection) return null
      sectionTitle = parseMarkdownMini(linkDataPageSection.title)
    } else if ('sectionTitles' in linkData && linkData.sectionTitles) {
      linkData.sectionTitles.forEach((title) => {
        if (determineSectionUrlHash(title) === hrefHash) {
          sectionTitle = parseMarkdownMini(title)
        }
      })
    }
    if (!sectionTitle) {
      if (doNotInferSectionTitle) {
        assertWarning(
          false,
          `Page section title not found for <Link href="\`${href}\`" doNotInferSectionTitle={true} />.`,
        )
        return null
      }
      sectionTitle = <>{determineSectionTitle(href)}</>
    }
  }

  return { linkData, sectionTitle, isLinkOnSamePage }
}

type LinkData = {
  url?: null | string
  title: string
  linkBreadcrumb: null | string[]
  sectionTitles?: string[]
}
function findLinkData(href: string, pageContext: PageContextResolved): LinkData | null {
  assert(href.startsWith('/') || href.startsWith('#'))
  const { linksAll } = pageContext
  const linkData = linksAll.find(({ url }) => href === url)
  if (href.startsWith('#')) {
    assertWarning(linkData, `Couldn't find ${href} in ${pageContext.urlPathname}, does it exist?`)
  } else {
    assertWarning(
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
  return linkData ?? null
}

function parseHref(href: string) {
  let hrefHash: string | null = null
  let hrefPathname: string | null = null
  if (!href.includes('#')) {
    hrefPathname = href
  } else {
    const [partsFirst, ...partsRest] = href.split('#')
    if (partsFirst) {
      hrefPathname = partsFirst
    }
    hrefHash = partsRest.join('#')
  }
  assert(hrefPathname !== null || hrefHash !== null)
  assert(hrefPathname || hrefHash)
  // Text highlight links e,g.  #metadata:~:text=global%20or%20local.-,Global%20metadata,-.
  if (hrefHash) hrefHash = hrefHash.split(':~:text')[0]!
  return { hrefPathname, hrefHash }
}
