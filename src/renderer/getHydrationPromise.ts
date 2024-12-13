export { getHydrationPromise }
export { setHydrationIsFinished }

import { getGlobalObject } from '../utils/client'
import { genPromise } from '../utils/genPromise'

const globalObject = getGlobalObject<{
  hydrationPromise: Promise<void>
  hydrationPromiseResolve: () => void
}>(
  'onRenderClient.ts',
  (() => {
    const { promise: hydrationPromise, resolve: hydrationPromiseResolve } = genPromise()
    return {
      hydrationPromise,
      hydrationPromiseResolve,
    }
  })(),
)

function getHydrationPromise() {
  return globalObject.hydrationPromise
}

function setHydrationIsFinished() {
  globalObject.hydrationPromiseResolve()
  // Used by:
  // - https://github.com/vikejs/vike/blob/9d67f3dd4bdfb38c835186b8147251e0e3b06657/docs/.testRun.ts#L22
  // - https://github.com/brillout/telefunc/blob/57c942c15b7795cfda96b5106acc9e098aa509aa/docs/.testRun.ts#L26
  ;(window as any).__docpress_hydrationFinished = true
}
