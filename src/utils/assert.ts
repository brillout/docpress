export { assert }
export { assertUsage }
export { assertWarning }

if (isBrowser()) {
  window.onerror = (err) => {
    console.log('err', err)
    alert(err)
    window.onerror = null
  }
}

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
    window.alert(err.stack)
  }
  throw err
}

function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  const err = new Error('[DocPress][Wrong Usage] ' + msg)
  if (isBrowserAndDev()) {
    window.alert(err.stack)
  }
  throw err
}

function isBrowser() {
  return typeof window !== 'undefined'
}
function isBrowserAndDev() {
  return isBrowser() && (window?.location?.port !== '' || window.localStorage['dev'])
}

function assertWarning(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  msg = '[DocPress][Warning] ' + msg
  console.warn(msg)
  if (isBrowserAndDev()) {
    window.alert(msg)
  }
}
