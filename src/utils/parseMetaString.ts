export { parseMetaString }

/**
 * Minimal parser for a metadata string into key-value pairs.
 *
 * Supports simple patterns: key or key=value (without quotes).
 *
 * Keys must contain only letters, dashes, or underscores (no digits).
 * Keys are converted to kebab-case. Values default to "true" if missing.
 *
 * Example:
 *   parseMetaString('foo fooBar="value"')
 *   => { foo: 'true', foo_bar: 'value' }
 *
 * @param metaString - The input metadata string.
 * @returns A plain object of parsed key-value pairs.
 */
function parseMetaString(metaString: string | null | undefined): Record<string, string> {
  if (!metaString) return {}

  const props: Record<string, string> = {}

  const keyValuePairRE = /([a-zA-Z_-]+)(?:=([^"'\s]+))?(?=\s|$)/g
  for (const match of metaString.matchAll(keyValuePairRE)) {
    let [_, key, value] = match
    props[kebabCase(key)] = value || 'true'
  }

  return props
}

// Simple function to convert a camelCase or PascalCase string to kebab-case.
function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace('_', '-')
    .toLowerCase()
}
