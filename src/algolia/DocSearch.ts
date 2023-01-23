import { escapeInject } from 'vite-plugin-ssr'
import { PageContextResolved } from '../config/resolvePageContext'

export { getDocSearchCSS }
export { getDocSearchJS }

function getDocSearchCSS(pageContext: PageContextResolved) {
  const docSearchCSS = !pageContext.meta.algolia
    ? ''
    : escapeInject`
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@alpha" />
    `
  return docSearchCSS
}

function getDocSearchJS(pageContext: PageContextResolved) {
  const docSearchJS = !pageContext.meta.algolia
    ? ''
    : escapeInject`
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@docsearch/js@alpha"></script>
    <script type="text/javascript">
      const transformData = ${getTransformData()};
      docsearch({
        appId: '${pageContext.meta.algolia.appId}',
        apiKey: '${pageContext.meta.algolia.apiKey}',
        indexName: '${pageContext.meta.algolia.indexName}',
        container: '#docsearch-desktop',
        transformData
      });
      docsearch({
        appId: '${pageContext.meta.algolia.appId}',
        apiKey: '${pageContext.meta.algolia.apiKey}',
        indexName: '${pageContext.meta.algolia.indexName}',
        container: '#docsearch-mobile',
        transformData
      });
    </script>
  `
  return docSearchJS
}

// Remove superfluous hash '#page-content' from URLs pointing to whole pages
//  - https://discourse.algolia.com/t/how-to-avoid-hash-in-search-result-url/6486
//  - https://discourse.algolia.com/t/docsearchs-transformdata-function-cannot-remove-hashes-from-result-urls/8487
function getTransformData() {
  return `function(hits) {
    hits.map(hit => {
      if (hit.anchor === 'page-content') {
        hit.url = hit.url.replace('#'+ hit.anchor, '');
        hit.anchor = null;
       }
    });
    return hits;
  }`
}
