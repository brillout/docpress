export { DocSearchInstall }

import React from 'react'
import { usePageContext } from '../renderer/usePageContext'
import { DocSearch as DocSearchButton } from '@docsearch/react'
import { Hit } from '../components/Algolia/Hit'

function DocSearchInstall() {
  const pageContext = usePageContext()
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
      />
    </div>
  )
}
