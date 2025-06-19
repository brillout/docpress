export { onCreateGlobalContext }

import type { GlobalContextServer } from 'vike/types'

async function onCreateGlobalContext(globalContext: GlobalContextServer) {
  // TODO/now: avoid this? At least pass only a subset?
  globalContext.configDocpress = globalContext.config.docpress
}
