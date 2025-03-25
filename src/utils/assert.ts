export { assert }
export { assertUsage }
export { assertWarning }

import { getGlobalObject } from './getGlobalObject.js'
const devModeKey = '__docpress_dev_mode'
const globalObject = getGlobalObject('utils/assert.ts', {
  alreadyLogged: new Set<string>(),
})

if (isBrowser()) {
  ;(window as any).toggleDevMode = toggleDevMode
  console.log(
    [
      '[@brillout/docpress] DEV MODE',
      isDevMode() ? 'enabled' : 'disabled',
      !isLocalhost() && '— run window.toggleDevMode() to toggle DEV MODE',
    ]
      .filter(Boolean)
      .join(' '),
  )
}
if (isDevMode()) {
  window.onerror = (err) => {
    window.alert(err)
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
  throw err
}

function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) {
    return
  }
  const err = new Error('[DocPress][Wrong Usage] ' + msg)
  throw err
}

function isBrowser() {
  return typeof window !== 'undefined'
}
function isDevMode() {
  return isBrowser() && (!!window.localStorage[devModeKey] || isLocalhost())
}
function isLocalhost() {
  return window?.location?.port !== ''
}
function toggleDevMode() {
  if (isLocalhost()) throw new Error('On localhost DEV MODE is always on.')
  const isEnabled = () => window.localStorage[devModeKey]
  if (!isEnabled()) {
    window.localStorage[devModeKey] = 'true'
  } else {
    delete window.localStorage[devModeKey]
  }
  console.log(`DEV MODE ${isEnabled() ? 'enabled' : 'disabled'}`)
}

function assertWarning(
  condition: unknown,
  msg: string,
  { onlyOnce = true, showStackTrace }: { onlyOnce?: boolean | string; showStackTrace?: true } = {},
) {
  if (condition) {
    return
  }
  const err = new Error(msg)
  if (!import.meta.env.DEV) {
    throw err
  } else {
    if (onlyOnce) {
      const { alreadyLogged } = globalObject
      const key = onlyOnce === true ? msg : onlyOnce
      if (alreadyLogged.has(key)) return
      alreadyLogged.add(key)
    }
    msg = '[DocPress][Warning] ' + msg
    if (!showStackTrace) {
      console.warn(msg)
    } else {
      console.warn(err)
    }
    if (isDevMode()) window.alert(err)
  }
}
