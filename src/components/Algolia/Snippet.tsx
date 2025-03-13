import { createElement } from 'react'
import { StoredDocSearchHit } from './types'

function getPropertyByPath(object: Record<string, any>, path: string): any {
  const parts = path.split('.')

  return parts.reduce((prev, current) => {
    if (prev?.[current]) return prev[current]
    return null
  }, object)
}

interface SnippetProps<TItem> {
  hit: TItem
  attribute: string
  tagName?: string
  [prop: string]: unknown
}

export function Snippet<TItem extends StoredDocSearchHit>({
  hit,
  attribute,
  tagName = 'span',
  ...rest
}: SnippetProps<TItem>) {
  let title = ''
  let lvl2 = ''

  if (!hit.__docsearch_parent && hit.type !== 'lvl1' && attribute !== 'content') {
    if (hit.type === 'content') {
      lvl2 = getPropertyByPath(hit, `_snippetResult.hierarchy.lvl2.value`) || getPropertyByPath(hit, 'hierarchy.lvl2')
      lvl2 = lvl2 ? ` > ${lvl2}` : ''
    } else {
      const lvl1 =
        getPropertyByPath(hit, `_snippetResult.hierarchy.lvl1.value`) || getPropertyByPath(hit, 'hierarchy.lvl1')
      title = lvl1 ? `${lvl1} > ` : ''
    }
  }

  return createElement(tagName, {
    ...rest,
    dangerouslySetInnerHTML: {
      __html: `${title}${getPropertyByPath(hit, `_snippetResult.${attribute}.value`) || getPropertyByPath(hit, attribute)}${lvl2}`,
    },
  })
}
