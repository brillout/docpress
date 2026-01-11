export { rehypeMetaToProps, parseMetaString }

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
        const meta = parseMetaString(node.data?.meta)
        parent.properties ??= {}
        parent.properties = { ...parent.properties, ...meta.props }
      }
    })
  }
}

/**
 * Simple parser for a metadata string into key-value pairs and a remaining unparsed string.
 *
 * Supports simple patterns: key or key=value.
 *
 * - Keys must contain only letters, dashes, or underscores (no digits).
 * - Keys are converted to kebab-case. Values default to "true" if missing.
 * - Keys and values are stored in `props`.
 * - If `propNames` is provided, only keys included in that list are extracted.
 * - Unextracted tokens remain in `rest`.
 *
 * @param meta - The input metadata string.
 * @param propNames - Optional whitelist of property names to extract.
 * @returns An object containing:
 *   - `props`: a map of extracted properties
 *   - `rest`: the remaining metadata string after extraction
 */
function parseMetaString<Name extends string = string>(meta: ElementData['meta'], propNames?: Name[]): PropsType<Name> {
  if (!meta) return { props: {}, rest: '' }

  let str = meta

  const keyValuePairRE = /(?<name>[a-zA-Z_-]+)(?:=([^"'\s]+))?/g
  const props: PropsType['props'] = {}

  str = str.replaceAll(keyValuePairRE, (match, name, value) => {
    if (propNames && !propNames.includes(name)) return match

    props[kebabCase(name)] = value || 'true'
    return ''
  })

  return { props, rest: str.trim() }
}

// Simple function to convert a camelCase or PascalCase string to kebab-case.
function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace('_', '-')
    .toLowerCase()
}

interface PropsType<Name extends string = string> {
  props: Partial<Record<Name, string>>
  rest: string
}
