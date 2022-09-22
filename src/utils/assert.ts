export { assert }
export { assertUsage }

function assert(condition: unknown, debugInfo?: unknown): asserts condition {
  if (condition) {
    return
  }
  const hasDebugInfo = debugInfo !== undefined
  if (hasDebugInfo) {
    console.log(debugInfo)
    if (typeof debugInfo === 'object') {
      debugInfo = JSON.stringify(debugInfo)
    }
  }
  let errMsg = '[DocPress] Bug. Contact DocPress maintainer.'
  if (hasDebugInfo) {
    errMsg += ' Debug info: ' + String(debugInfo)
  }
  const err = new Error(errMsg)
  if (isBrowserAndDev()) {
    alert(err.stack)
  }
  throw err
}

function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  const err = new Error('[DocPress][Wrong Usage] ' + msg)
  if (isBrowserAndDev()) {
    alert(err.stack)
  }
  throw err
}

function isBrowserAndDev() {
  return typeof window !== 'undefined' && window?.location?.port !== ''
}
