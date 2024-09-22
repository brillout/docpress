export { assert }
export { assertUsage }
export { assertWarning }

const devModeKey = '__docpress_dev_mode'

if (isBrowser()) {
  ;(window as any).toggleDevMode = toggleDevMode
  console.log(
    [
      '[@brillout/docpress] DEV MODE',
      isDevMode() ? 'enabled' : 'disabled',
      !isLocalhost() && 'run window.toggleDevMode() to toggle DEV MODE',
    ]
      .filter(Boolean)
      .join(' '),
  )
  if (isDevMode()) {
    window.onerror = (err) => {
      alert(err)
      window.onerror = null
    }
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
  if (isBrowser() && isDevMode()) {
    window.alert(err.stack)
  }
  throw err
}

function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  const err = new Error('[DocPress][Wrong Usage] ' + msg)
  if (isBrowser() && isDevMode()) {
    window.alert(err.stack)
  }
  throw err
}

function isBrowser() {
  return typeof window !== 'undefined'
}
function isDevMode() {
  return !!window.localStorage[devModeKey] || isLocalhost()
}
function isLocalhost() {
  return window?.location?.port !== ''
}
function toggleDevMode() {
  if (isLocalhost()) throw new Error('On localhost DEV MODE is always on.')
  if (window.localStorage[devModeKey]) {
    window.localStorage[devModeKey] = 'true'
  } else {
    delete window.localStorage[devModeKey]
  }
  console.log(`DEV MODE ${isDevMode() ? 'enabled' : 'disabled'}`)
}

function assertWarning(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  msg = '[DocPress][Warning] ' + msg
  console.warn(msg)
  if (isBrowser() && isDevMode()) {
    window.alert(msg)
  }
}
