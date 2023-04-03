import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr/server'
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
  const { algolia } = pageContext.meta
  const docSearchJS = !algolia
    ? ''
    : escapeInject`
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@docsearch/js@alpha"></script>
    <script type="text/javascript">
      const appId = '${algolia.appId}';
      const apiKey = '${algolia.apiKey}';
      const indexName = '${algolia.indexName}';
      const transformItems = ${dangerouslySkipEscape(getTransformItems())};
      docsearch({
        container: '#docsearch-desktop',
        appId, apiKey, indexName, transformItems
      });
      docsearch({
        container: '#docsearch-mobile',
        appId, apiKey, indexName, transformItems
      });
    </script>
  `
  return docSearchJS
}

// Remove superfluous hash '#page-content' from URLs pointing to whole pages
//  - https://github.com/algolia/docsearch/issues/1801
//  - https://discourse.algolia.com/t/how-to-avoid-hash-in-search-result-url/6486
//  - https://discourse.algolia.com/t/docsearchs-transformdata-function-cannot-remove-hashes-from-result-urls/8487
function getTransformItems() {
  return `function(hits) {
        hits.map(hit => {
          if (hit.url.indexOf('#page-content') > 0) {
            hit.url = hit.url.replace('#page-content', '');
          }
        });
        return hits;
      }`
}
