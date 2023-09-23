export { getDocSearchCSS }
export { getDocSearchJS }

import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr/server'
import { PageContextResolved } from '../config/resolvePageContext'
/* Imorted in /src/css/index.css instead
import './DocSearch.css'
*/

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
  // If the docpress website doesn't use algolia => we don't inject the algolia assets => the search icon wrapper stays empty
  // If algolia is PENDING_APPROVAL => we fill a FAKE API key so that the algolia popup shows (while no results are shown).
  //  - We show an alert warning users that there aren't any results until algolia's approval is pending (see below).
  let docSearchJS = !algolia
    ? ''
    : escapeInject`
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@docsearch/js@alpha"></script>
    <script type="text/javascript">
      const appId = '${algolia.appId || 'FAKE'}';
      const apiKey = '${algolia.apiKey || 'FAKE'}';
      const indexName = '${algolia.indexName || 'FAKE'}';
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
  if (algolia?.PENDING_APPROVAL) {
    docSearchJS = escapeInject`
    ${docSearchJS}
    <script>[document.getElementById('docsearch-desktop'), document.getElementById('docsearch-mobile')].forEach(el => el.addEventListener('click', () => window.alert("Algolia approval is pending: the search results will be empty. Try again in a couple of days.")))</script>
    `
  }
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
