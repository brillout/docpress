export { Navigation }
export { NavigationMask }

import React from 'react'
import { NavigationHeader } from './NavigationHeader'
import { Heading } from '../headings'
import { assert, Emoji, assertWarning, jsxToTextContent } from '../utils/server'
import './Navigation.css'
import { NavigationFullscreenClose } from './navigation-fullscreen/NavigationFullscreenButton'

function Navigation({
  pageContext
}: {
  pageContext: {
    headingsWithSubHeadings: Heading[]
    urlPathname: string
    isDetachedPage: boolean
  }
}) {
  const { isDetachedPage } = pageContext
  return (
    <>
      <div id="navigation-container">
        <NavigationHeader />
        {isDetachedPage && <DetachedPageNote />}
        <NavigationContent pageContext={pageContext} />
        {/* <ScrollOverlay /> */}
        <NavigationFullscreenClose />
      </div>
    </>
  )
}

function NavigationMask() {
  return <div id="navigation-mask" />
}

function NavigationContent({
  pageContext
}: {
  pageContext: {
    headingsWithSubHeadings: Heading[]
    urlPathname: string
    isDetachedPage: boolean
  }
}) {
  const headings = getHeadingsWithComputedProps(pageContext)

  const headingsGrouped = groupHeadings(headings)

  return (
    <div id="navigation-content">
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
      isChildOfListHeading: boolean
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
        heading.computed.isChildOfListHeading && 'nav-item-parent-is-list-heading',
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
  headings.forEach((heading) => {
    if (heading.level === 1) {
      headingsGrouped.push({ ...heading, headings: [] })
    } else {
      headingsGrouped[headingsGrouped.length - 1].headings.push(heading)
    }
  })
  return headingsGrouped
}

function getHeadingsWithComputedProps(pageContext: {
  headingsWithSubHeadings: Heading[]
  urlPathname: string
  isDetachedPage: boolean
}) {
  const { headingsWithSubHeadings, urlPathname } = pageContext
  return headingsWithSubHeadings.map((heading, i) => {
    assert([1, 2, 3, 4].includes(heading.level), heading)

    const headingPrevious = headingsWithSubHeadings[i - 1]
    const headingNext = headingsWithSubHeadings[i + 1]

    let isActiveFirst = false
    let isActiveLast = false
    let isActive = false
    if (heading.url === urlPathname) {
      assert(heading.level === 2, { urlPathname })
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
    const isChildOfListHeading = !!heading.parentHeadings[0]?.isListTitle

    return {
      ...heading,
      computed: {
        isActive,
        isActiveFirst,
        isActiveLast,
        isFirstOfItsKind,
        isLastOfItsKind,
        isChildOfListHeading
      }
    }
  })
}

function ScrollOverlay() {
  // const width = '1px'
  // const color = '#aaa'
  return (
    <div
      id="scroll-overlay"
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        left: '0',
        width: '100%',
        /*
        background: `linear-gradient(to right, ${color} ${width}, transparent ${width}) 0 0,
    linear-gradient(to right, ${color} ${width}, transparent ${width}) 0 100%,
    linear-gradient(to left, ${color} ${width}, transparent ${width}) 100% 0,
    linear-gradient(to left, ${color} ${width}, transparent ${width}) 100% 100%,
    linear-gradient(to bottom, ${color} ${width}, transparent ${width}) 0 0,
    linear-gradient(to bottom, ${color} ${width}, transparent ${width}) 100% 0,
    linear-gradient(to top, ${color} ${width}, transparent ${width}) 0 100%,
    linear-gradient(to top, ${color} ${width}, transparent ${width}) 100% 100%`,
        //*/
        //borderRight: `5px solid ${color}`,
        borderRight: `3px solid #666`,
        //border: `1px solid ${color}`,
        boxSizing: 'border-box',
        // backgroundColor: 'rgba(0,0,0,0.03)',
        backgroundRepeat: 'no-repeat',

        backgroundSize: '10px 10px'
      }}
    />
  )
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
        marginTop: 30,
        marginBottom: -8,
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
