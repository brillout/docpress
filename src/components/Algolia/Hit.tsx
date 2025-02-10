export { Hit }

import React from 'react'
import { DocSearch } from '@docsearch/react'
import type { InternalDocSearchHit } from './types'
import { Snippet } from './Snippet'
import { SourceIcon } from './SourceIcon'
import { SelectIcon } from './SelectIcon'

type HitProps = Parameters<typeof DocSearch>[0]['hitComponent']
type ContentType = 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6'

const Hit: HitProps = ({ hit }) => {
  return (
    <a href={hit.url}>
      <div className="DocSearch-Hit-Container">
        {(hit as InternalDocSearchHit).__docsearch_parent && (
          <svg className="DocSearch-Hit-Tree" viewBox="0 0 24 54">
            <g stroke="currentColor" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
              {!(hit as InternalDocSearchHit).__docsearch_parent ? (
                <path d="M8 6v21M20 27H8.3" />
              ) : (
                <path d="M8 6v42M20 27H8.3" />
              )}
            </g>
          </svg>
        )}

        <div className="DocSearch-Hit-icon">
          <SourceIcon type={hit.type} />
        </div>
        {hit.hierarchy[hit.type as ContentType] && hit.type === 'lvl1' && (
          <div className="DocSearch-Hit-content-wrapper">
            <Snippet className="DocSearch-Hit-title" hit={hit} attribute="hierarchy.lvl1" />
            {hit.content && <Snippet className="DocSearch-Hit-path" hit={hit} attribute="content" />}
          </div>
        )}

        {hit.hierarchy[hit.type as ContentType] &&
          (hit.type === 'lvl2' ||
            hit.type === 'lvl3' ||
            hit.type === 'lvl4' ||
            hit.type === 'lvl5' ||
            hit.type === 'lvl6') && (
            <div className="DocSearch-Hit-content-wrapper">
              <Snippet className="DocSearch-Hit-title" hit={hit} attribute={`hierarchy.${hit.type}`} />
              <Snippet
                className="DocSearch-Hit-path"
                hit={hit}
                attribute={hit.content ? 'content' : 'hierarchy.lvl1'}
              />
            </div>
          )}

        {hit.type === 'content' && (
          <div className="DocSearch-Hit-content-wrapper">
            <Snippet className="DocSearch-Hit-title" hit={hit} attribute="hierarchy.lvl1" />
            <Snippet className="DocSearch-Hit-path" hit={hit} attribute="content" />
          </div>
        )}
        <div className="DocSearch-Hit-action">
          <SelectIcon />
        </div>
      </div>
    </a>
  )
}
