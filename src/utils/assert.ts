export { assert }
export { assertUsage }

function assert(condition: unknown, debugInfo?: unknown): asserts condition {
  if (condition) {
    return
  }
  if (debugInfo !== undefined) {
    if (typeof debugInfo === 'object') {
      debugInfo = JSON.stringify(debugInfo)
    }
    console.log(debugInfo)
  }
  const err = new Error('[VikePress] Bug. Contact VikePress maintainer.')
  if (isBrowserAndDev()) {
    alert(err.stack)
  }
  throw err
}

function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  const err = new Error('[VikePress][Wrong Usage] ' + msg)
  if (isBrowserAndDev()) {
    alert(err.stack)
  }
  throw err
}

function isBrowserAndDev() {
  return typeof window !== 'undefined' && window?.location?.port !== ''
}
