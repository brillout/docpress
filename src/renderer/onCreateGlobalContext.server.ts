export { onCreateGlobalContext }

import type { GlobalContextServer } from 'vike/types'

async function onCreateGlobalContext(globalContext: GlobalContextServer) {
  // TODO/now/+docpress-isomorphic: remove
  // globalContext.configDocpress = globalContext.config.docpress
}
