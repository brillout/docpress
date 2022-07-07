import React from 'react'
import { NavigationHeader } from './NavigationHeader'
import { Heading } from '../headings'
import { assert } from '../utils'
import { Emoji } from '../utils/Emoji'
import './Navigation.css'

export { Navigation }

function Navigation({
  pageContext
}: {
  pageContext: {
    headingsWithSubHeadings: Heading[]
    urlPathname: string
    isDetachedPage: boolean
  }
}) {
  const { headingsWithSubHeadings, urlPathname, isDetachedPage } = pageContext
  return (
    <>
      <div id="navigation-container">
        <NavigationHeader />
        {isDetachedPage && <DetachedPageNote />}
        <div id="navigation-content" style={{ position: 'relative' }}>
          {headingsWithSubHeadings.map((heading, i) => {
            assert([1, 2, 3, 4].includes(heading.level), heading)

            const headingPrevious = headingsWithSubHeadings[i - 1]
            const headingNext = headingsWithSubHeadings[i + 1]

            let isActiveFirst = false
            let isActiveLast = false
            let isActive
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

            return (
              <a
                className={[
                  'nav-item',
                  'nav-item-h' + heading.level,
                  isActive && ' is-active',
                  isActiveFirst && ' is-active-first',
                  isActiveLast && ' is-active-last',
                  heading.parentHeadings[0]?.isListTitle && 'nav-item-parent-is-list-heading',
                  heading.level !== headingPrevious?.level && 'nav-item-first-of-its-kind',
                  heading.level !== headingNext?.level && 'nav-item-last-of-its-kind'
                ]
                  .filter(Boolean)
                  .join(' ')}
                href={heading.url || undefined}
                key={i}
              >
                {heading.titleInNav}
              </a>
            )
          })}
          {/*
      <ScrollOverlay />
      */}
        </div>
      </div>
      <div id="navigation-mask" />
    </>
  )
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
        &mdash; this page is not listed in the navigation menu below.
      </span>
    </div>
  )
}
