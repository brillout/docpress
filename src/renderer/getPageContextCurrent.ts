export { getpageContextCurrent }
export { setpageContextCurrent }

import { PageContextClient } from 'vike/types'
import { getGlobalObject } from '../utils/getGlobalObject'

const globalObject = getGlobalObject<{
  pageContextCurrent?: PageContextClient
}>('onRenderClient.ts', {})

function getpageContextCurrent(): undefined | PageContextClient {
  return globalObject.pageContextCurrent
}
function setpageContextCurrent(pageContext: PageContextClient): void {
  globalObject.pageContextCurrent = pageContext
}
