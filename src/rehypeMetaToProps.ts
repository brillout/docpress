export { rehypeMetaToProps }

import { visit } from 'unist-util-visit'
import type { ElementData, Root } from 'hast'

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

/**
 * Minimal parser for a metadata string into key-value pairs.
 *
 * Supports simple patterns: key or key="value".
 *
 * Keys must contain only letters, dashes, or underscores (no digits).
 * Keys are converted to snake_case. Values default to "true" if missing.
 *
 * Example:
 *   parseMetaString('foo fooBar="value"')
 *   => { foo: 'true', foo_bar: 'value' }
 *
 * @param metaString - The input metadata string.
 * @returns A plain object of parsed key-value pairs.
 */
function parseMetaString(metaString: ElementData['meta']): Record<string, string> {
  if (!metaString) return {}

  const props: Record<string, string> = {}

  const keyValuePairRE = /([a-zA-Z_-]+)(?:="([^"]*)")?(?=\s|$)/g
  for (const match of metaString.matchAll(keyValuePairRE)) {
    let [_, key, value] = match
    props[snakeCase(key)] = value || 'true'
  }

  return props
}

// Simple function to convert a camelCase or PascalCase string to snake_case.
function snakeCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
