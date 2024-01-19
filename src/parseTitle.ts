export { parseTitle }
export { getHeadingsWithProcessedTitle }

import React from 'react'
import type { HeadingDefinition, HeadingDetachedDefinition, Heading, HeadingDetached } from './types/Heading'
import { assert, Emoji, EmojiName } from './utils/server'

function getHeadingsWithProcessedTitle(config: {
  headings: HeadingDefinition[]
  headingsDetached: HeadingDetachedDefinition[]
}): {
  headingsProcessed: Heading[]
  headingsDetachedProcessed: HeadingDetached[]
} {
  const headingsWithoutBreadcrumb: Omit<Heading, 'headingsBreadcrumb'>[] = config.headings.map((heading: HeadingDefinition) => {
    const titleProcessed: JSX.Element = parseTitle(heading.title)

    const titleInNav = heading.titleInNav || heading.title
    let titleInNavProcessed: JSX.Element
    titleInNavProcessed = parseTitle(titleInNav)
    if ('titleEmoji' in heading) {
      assert(heading.titleEmoji)
      titleInNavProcessed = withEmoji(heading.titleEmoji, titleInNavProcessed)
    }

    const headingProcessed: Omit<Heading, 'headingsBreadcrumb'> = {
      ...heading,
      title: titleProcessed,
      titleInNav: titleInNavProcessed
    }
    return headingProcessed
  })

  const headingsProcessed: Heading[] = []
  headingsWithoutBreadcrumb.forEach((heading) => {
    const headingsBreadcrumb = getHeadingsBreadcrumb(heading, headingsProcessed)
    headingsProcessed.push({
      ...heading,
      headingsBreadcrumb
    })
  })

  const headingsDetachedProcessed = config.headingsDetached.map((headingsDetached) => {
    const { url, title } = headingsDetached
    assert(
      headingsProcessed.find((heading) => heading.url === url) === undefined,
      `remove ${headingsDetached.url} from headingsDetached`
    )
    const titleProcessed = typeof title === 'string' ? parseTitle(title) : title
    return {
      ...headingsDetached,
      level: 2 as const,
      title: titleProcessed,
      titleInNav: titleProcessed,
      headingsBreadcrumb: null
    }
  })

  assertHeadingsUrl([...headingsProcessed, ...headingsDetachedProcessed])
  return { headingsProcessed, headingsDetachedProcessed }
}

function getHeadingsBreadcrumb(heading: Omit<Heading, 'headingsBreadcrumb'>, headings: Heading[]) {
  const headingsBreadcrumb: Heading[] = []
  let levelCurrent = heading.level
  headings
    .slice()
    .reverse()
    .forEach((parentCandidate) => {
      const isParent = parentCandidate.level < levelCurrent
      if (isParent) {
        levelCurrent = parentCandidate.level
        headingsBreadcrumb.push(parentCandidate)
      }
    })
  return headingsBreadcrumb
}

function assertHeadingsUrl(headings: { url?: null | string }[]) {
  headings.forEach((heading) => {
    if (heading.url) {
      const { url } = heading
      assert(url.startsWith('/'))
    }
  })
}

function parseTitle(title: string): JSX.Element {
  type Part = { nodeType: 'text' | 'code'; content: string }
  const parts: Part[] = []
  let current: Part | undefined
  title.split('').forEach((letter) => {
    if (letter === '`') {
      if (current?.nodeType === 'code') {
        // </code>
        parts.push(current)
        current = undefined
      } else {
        // <code>
        if (current) {
          parts.push(current)
        }
        current = { nodeType: 'code', content: '' }
      }
    } else {
      if (!current) {
        current = { nodeType: 'text', content: '' }
      }
      current.content += letter
    }
  })
  if (current) {
    parts.push(current)
  }

  const titleJsx = React.createElement(
    React.Fragment,
    {},
    ...parts.map((part, i) =>
      React.createElement(part.nodeType === 'code' ? 'code' : React.Fragment, { key: i }, part.content)
    )
  )

  return titleJsx
}

function withEmoji(name: EmojiName, title: string | JSX.Element): JSX.Element {
  const style = { fontSize: '1.4em' }
  //return React.createElement(React.Fragment, null, Emoji({ name, style }), ' ', title)
  return React.createElement(
    'span',
    { style },
    Emoji({ name }),
    ' ',
    React.createElement('span', { style: { fontSize: '1rem' } }, title)
  )
}
