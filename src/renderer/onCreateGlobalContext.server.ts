export { onCreateGlobalContext }

import type { GlobalContextServer } from 'vike/types'
import type { Config as DocpressConfig } from '../types/Config'

async function onCreateGlobalContext(globalContext: GlobalContextServer) {
  // TODO: avoid this? At least pass only a subset?
  globalContext.configDocpress = globalContext.config.docpress
}

declare global {
  namespace Vike {
    interface GlobalContext {
      // Passed to client
      configDocpress: DocpressConfig
    }
  }
}
