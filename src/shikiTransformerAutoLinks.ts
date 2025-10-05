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
      // Only process spans that have a single text node as their child.
      if (span.children.length !== 1) return
      let child = span.children[0]
      if (child.type !== 'text') return

      // Find all matching URLs in the text node's value using the regex.
      const links: { href: string; index: number }[] = []
      const matches = Array.from(child.value.matchAll(linkRE))

      // Filter out URLs that contain `${...}`. e.g. `https://star-wars.brillout.com/api/films/${id}.json`.
      const filtered = matches.filter(([href]) => !href.includes('${'))
      if (filtered.length === 0) return

      for (const match of filtered) {
        const [href] = match
        links.unshift({ href, index: match.index })
      }

      // Prepare a new list of children to replace the original span's children.
      const newChildren: typeof span.children = []
      // Iterate over the matched links.
      for (const { href, index } of links) {
        const postIndex = index + href.length
        const postValue = child.value.slice(postIndex)

        // Preserve any text after the URL as a text node.
        if (postValue.length > 0) {
          newChildren.unshift({ type: 'text', value: postValue })
        }

        // Insert a clickable `<a>` element for the URL.
        newChildren.unshift({
          type: 'element',
          tagName: 'a',
          properties: { href },
          children: [{ type: 'text', value: href }],
        })

        // Update remaining text before the URL for the next iteration.
        child = {
          type: 'text',
          value: child.value.slice(0, index),
        }
      }

      // Add any remaining text before the first URL.
      if (child.value.length > 0) {
        newChildren.unshift(child)
      }

      // Replace the original span's children.
      span.children = newChildren
    },
  }
}
