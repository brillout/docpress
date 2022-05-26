import { escapeInject } from 'vite-plugin-ssr'
import { PageContextAdded } from '../processPageContext'

export { getDocSearchCSS }
export { getDocSearchJS }

function getDocSearchCSS(pageContext: PageContextAdded) {
  const docSearchCSS = !pageContext.meta.algolia
    ? ''
    : escapeInject`
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@alpha" />
    `
  return docSearchCSS
}

function getDocSearchJS(pageContext: PageContextAdded) {
  const docSearchJS = !pageContext.meta.algolia
    ? ''
    : escapeInject`
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@docsearch/js@alpha"></script>
    <script type="text/javascript">
      docsearch({
        appId: '${pageContext.meta.algolia.appId}',
        apiKey: '${pageContext.meta.algolia.apiKey}',
        indexName: '${pageContext.meta.algolia.indexName}',
        container: '#docsearch-desktop',
      })
      docsearch({
        appId: '${pageContext.meta.algolia.appId}',
        apiKey: '${pageContext.meta.algolia.apiKey}',
        indexName: '${pageContext.meta.algolia.indexName}',
        container: '#docsearch-mobile',
      })
    </script>
  `
  return docSearchJS
}
