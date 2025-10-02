export { rehypeMetaToProps }

import type { Root } from 'hast'
import { visit } from 'unist-util-visit'
import { parseMetaString } from './utils/parseMetaString.js'

/**
 * Rehype plugin to extract metadata from `<code>` blocks in markdown
 * and attach them as props to the parent `<pre>` element.
 *
 * This allows using those props inside a custom `<Pre>` component.
 *
 * Example:
 * ~~~mdx
 * ```js foo="bar" hide_copy='true'
 * export function add(a, b) {
 *   return a + b
 * }
 * ```
 * ~~~
 * These props are then added to the `<pre>` element
 */
function rehypeMetaToProps() {
  return (tree: Root) => {
    visit(tree, 'element', (node, _index, parent) => {
      if (node.tagName === 'code' && parent?.type === 'element' && parent.tagName === 'pre') {
        const props = parseMetaString(node.data?.meta)
        parent.properties ??= {}
        parent.properties = { ...parent.properties, ...props }
      }
    })
  }
}
