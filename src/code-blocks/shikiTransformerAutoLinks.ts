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
      let child = span.children[0]!
      if (child.type !== 'text') return

      const links: { href: string; index: number }[] = []
      const matches = Array.from((child as any).value.matchAll(linkRE))

      // Filter out URLs that contain `${...}`. e.g. `https://star-wars.brillout.com/api/films/${id}.json`.
      const filtered = (matches as any).filter(([href]: any) => !href.includes('${'))
      if (filtered.length === 0) return

      for (const match of filtered) {
        const [href] = match as any
        links.unshift({ href, index: (match as any).index! })
      }

      const newChildren: typeof span.children = []
      for (const { href, index } of links) {
        const postIndex = index + href.length
        const postValue = (child as any).value.slice(postIndex)

        if (postValue.length > 0) {
          newChildren.unshift({ type: 'text', value: postValue })
        }

        newChildren.unshift({
          type: 'element',
          tagName: 'a',
          properties: { href },
          children: [{ type: 'text', value: href }],
        })

        child = {
          type: 'text',
          value: (child as any).value.slice(0, index),
        } as any
      }

      if ((child as any).value.length > 0) {
        newChildren.unshift(child)
      }

      span.children = newChildren
    },
  }
}
