export { rehypeMetaToProps }

import { visit } from 'unist-util-visit'
import type { Root } from 'hast'

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
        const metaString = node.data?.meta || ''
        const props = parseMetaString(metaString)
        parent.properties ??= {}
        parent.properties = { ...parent.properties, ...props }
      }
    })
  }
}

/**
 * Parses a metadata string into a key-value object.
 *
 * Supports key-value pairs in the format:
 *   key="value", key='value', or key=value (unquoted)
 * Keys are converted to snake_case.
 *
 * Values can be wrapped in single quotes, double quotes, or left unquoted.
 *
 * Example:
 *   parseMetaString('foo=bar fooBar="value" userId=\'123\'')
 *   => { foo: 'bar', foo_bar: 'value', 'user_id': '123' }
 *
 * @param metaString - The input string containing key-value metadata.
 * @returns An object mapping normalized keys to string values.
 */
function parseMetaString(metaString: string): Record<string, string> {
  const props = new Map<string, string>()

  const keyValuePairRE = /\b([-\w]+)=(?:"([^"]*)"|'([^']*)'|([^"'\s]+))/g
  for (const match of metaString.matchAll(keyValuePairRE)) {
    const [_, key, doubleQuoted, singleQuoted, unquoted] = match
    const value = doubleQuoted || singleQuoted || unquoted
    props.set(snakeCase(key), value)
  }

  return Object.fromEntries(props)
}

// Simple function to convert a camelCase or PascalCase string to snake_case.
function snakeCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
