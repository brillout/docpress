export { Navigation }
export { NavigationMask }

import React from 'react'
import { NavigationHeader } from './NavigationHeader'
import { Heading, HeadingDetached } from '../types/Heading'
import { assert, Emoji, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { NavigationFullscreenClose } from './navigation-fullscreen/NavigationFullscreenButton'

function Navigation({
  pageContext
}: {
  pageContext: {
    headingsProcessed: Heading[]
    headingsOfDetachedPage: null | (Heading | HeadingDetached)[]
    urlPathname: string
  }
}) {
  const currentUrl = pageContext.urlPathname
  return (
    <>
      <div id="navigation-container">
        <NavigationHeader />
        {pageContext.headingsOfDetachedPage && (
          <>
            {pageContext.headingsOfDetachedPage.length > 1 && (
              <NavigationContent
                id="navigation-content-detached"
                headingsProcessed={pageContext.headingsOfDetachedPage}
                currentUrl={currentUrl}
              />
            )}
            <DetachedPageNote />
          </>
        )}
        <NavigationContent
          id="navigation-content-main"
          headingsProcessed={pageContext.headingsProcessed}
          currentUrl={currentUrl}
        />
        {/* <ScrollOverlay /> */}
        <NavigationFullscreenClose />
      </div>
    </>
  )
}

function NavigationMask() {
  return <div id="navigation-mask" />
}

function NavigationContent(props: {
  id: 'navigation-content-main' | 'navigation-content-detached'
  headingsProcessed: (Heading | HeadingDetached)[]
  currentUrl: string
}) {
  const headings = getHeadingsWithComputedProps(props.headingsProcessed, props.currentUrl)

  const headingsGrouped = groupHeadings(headings)

  return (
    <div id={props.id} className="navigation-content">
      <div className="nav-column" style={{ position: 'relative' }}>
        {headingsGrouped.map((headingsH1, i) => (
          <div className="nav-h1-group" key={i}>
            <Heading heading={headingsH1} />
            {headingsH1.headings.map((heading, j) => (
              <Heading heading={heading} key={j} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Heading({
  heading
}: {
  heading: {
    level: number
    url?: string | null
    title: string | JSX.Element
    titleInNav: string | JSX.Element
    computed: {
      isActive: boolean
      isActiveFirst: boolean
      isActiveLast: boolean
      isFirstOfItsKind: boolean
      isLastOfItsKind: boolean
    }
  }
}) {
  assert([1, 2, 3, 4].includes(heading.level), heading)
  if (heading.level === 1 || heading.level === 4) {
    assert(heading.url === undefined)
  } else {
    const sectionTitle = jsxToTextContent(heading.title)
    assertWarning(
      heading.url,
      `${jsxToTextContent(
        heading.titleInNav
      )} is missing a URL hash. Use \`<h2 id="url-hash">${sectionTitle}</h2>\` instead of \`## ${sectionTitle}\`.`
    )
  }
  return (
    <a
      className={[
        'nav-item',
        'nav-item-h' + heading.level,
        heading.computed.isActive && ' is-active',
        heading.computed.isActiveFirst && ' is-active-first',
        heading.computed.isActiveLast && ' is-active-last',
        heading.computed.isFirstOfItsKind && 'nav-item-first-of-its-kind',
        heading.computed.isLastOfItsKind && 'nav-item-last-of-its-kind'
      ]
        .filter(Boolean)
        .join(' ')}
      href={heading.url ?? undefined}
    >
      {/* <span className="nav-item-text">{heading.titleInNav}</span> */}
      {heading.titleInNav}
    </a>
  )
}

function groupHeadings<T extends { level: number }>(headings: T[]) {
  const headingsGrouped: (T & { headings: T[] })[] = []
  const headingLevelMin: number = Math.min(...headings.map((h) => h.level))
  headings.forEach((heading) => {
    if (heading.level === headingLevelMin) {
      headingsGrouped.push({ ...heading, headings: [] })
    } else {
      headingsGrouped[headingsGrouped.length - 1].headings.push(heading)
    }
  })
  return headingsGrouped
}

function getHeadingsWithComputedProps(headings: (Heading | HeadingDetached)[], currentUrl: string) {
  return headings.map((heading, i) => {
    assert([1, 2, 3, 4].includes(heading.level), heading)

    const headingPrevious = headings[i - 1]
    const headingNext = headings[i + 1]

    let isActiveFirst = false
    let isActiveLast = false
    let isActive = false
    if (heading.url === currentUrl) {
      assert(heading.level === 2, { currentUrl })
      isActive = true
      isActiveFirst = true
      if (headingNext?.level !== 3) {
        isActiveLast = true
      }
    }
    if (heading.level === 3) {
      isActive = true
      if (headingNext?.level !== 3) {
        isActiveLast = true
      }
    }

    const isFirstOfItsKind = heading.level !== headingPrevious?.level
    const isLastOfItsKind = heading.level !== headingNext?.level

    return {
      ...heading,
      computed: {
        isActive,
        isActiveFirst,
        isActiveLast,
        isFirstOfItsKind,
        isLastOfItsKind
      }
    }
  })
}

function DetachedPageNote() {
  return (
    <div
      id="detached-note"
      style={{
        backgroundColor: 'var(--background-color)',
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 25,
        marginBottom: -5,
        borderRadius: 5,
        padding: 10
      }}
    >
      <Emoji name="info" />{' '}
      <b>
        <em>Detached</em>
      </b>
      <span
        style={{
          opacity: 0.8
        }}
      >
        {' '}
        &mdash; this page isn't listed in the navigation below.
      </span>
    </div>
  )
}
