export { DocSearchInstall }

import React from 'react'
import { usePageContext2 } from '../renderer/usePageContext'
import { DocSearch as DocSearchButton } from '@docsearch/react'
import { Hit } from '../components/Algolia/Hit'

function DocSearchInstall() {
  const pageContext = usePageContext2().pageContextResolved
  const { algolia } = pageContext.meta
  if (!algolia) return null
  return (
    <div style={{ display: 'none' }}>
      <DocSearchButton
        appId={algolia.appId}
        indexName={algolia.indexName}
        apiKey={algolia.apiKey}
        insights={true}
        hitComponent={Hit}
        maxResultsPerGroup={Infinity}
        searchParameters={{
          filters: 'is_available:true',
        }}
        transformItems={(hits) => {
          hits.map((hit) => {
            if (hit.type === 'lvl1') {
              hit.url = hit.url.split('#')[0]
            }
          })
          return hits
        }}
      />
    </div>
  )
}
