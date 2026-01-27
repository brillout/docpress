export { shikiTransformerAutoLinks }

import type { ShikiTransformer } from 'shiki'

const linkRE = /https:\/\/[^\s]*[^.,\s"'`]/g

/**
 * A Shiki transformer that converts plain HTTPS URLs in code blocks into clickable `<a>` links.
 *
 * Inspired by `@jcayzac/shiki-transformer-autolinks`, but tailored for a narrower use case.
 */
function shikiTransformerAutoLinks(): ShikiTransformer {
  return {
    name: 'docpress-shiki-autolinks',
    span(span) {
      if (span.children.length !== 1) return
      const child = span.children[0]
      if (!child || child.type !== 'text') return

      const links: { href: string; index: number }[] = []
      const matches = Array.from(child.value.matchAll(linkRE))

      // Filter out URLs that contain `${...}`. e.g. `https://star-wars.brillout.com/api/films/${id}.json`.
      const filtered = matches.filter((match) => {
        const href = match[0]
        return href && !href.includes('${')
      })
      if (filtered.length === 0) return

      for (const match of filtered) {
        const href = match[0]
        const index = match.index
        if (href && index !== undefined) {
          links.unshift({ href, index })
        }
      }

      const newChildren: typeof span.children = []
      let currentChild = child
      for (const { href, index } of links) {
        const postIndex = index + href.length
        const postValue = currentChild.value.slice(postIndex)

        if (postValue.length > 0) {
          newChildren.unshift({ type: 'text', value: postValue })
        }

        newChildren.unshift({
          type: 'element',
          tagName: 'a',
          properties: { href },
          children: [{ type: 'text', value: href }],
        })

        currentChild = {
          type: 'text',
          value: currentChild.value.slice(0, index),
        }
      }

      if (currentChild.value.length > 0) {
        newChildren.unshift(currentChild)
      }

      span.children = newChildren
    },
  }
}
