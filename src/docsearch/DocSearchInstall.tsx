export { DocSearchInstall }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext.js'
import { DocSearch as DocSearchButton } from '@docsearch/react'
import { Hit } from '../components/Algolia/Hit.js'

function DocSearchInstall() {
  const pageContext = usePageContext()
  const { algolia } = pageContext.globalContext.config.docpress
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
          hitsPerPage: 50,
        }}
        transformItems={(hits) => {
          hits.map((hit) => {
            if (hit.type === 'lvl1') hit.url = hit.url.split('#')[0]!
          })
          hits.sort((a, b) => Number(a.url.includes('#')) - Number(b.url.includes('#')))
          return hits
        }}
      />
    </div>
  )
}
