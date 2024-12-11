export { css }
export { cssStopDedupe }
export { cssResetDedupe }

import { getGlobalObject } from './getGlobalObject'

const globalObject = getGlobalObject('utils/css.ts', {
  alreadyGenerated: {} as Record<string, boolean>,
  stopDedupe: false,
})

function css(strings: TemplateStringsArray | string[], ...values: (string | number)[]): string {
  // The boring part
  let result = strings
    .map((str, i) => {
      let s = str
      if (i !== strings.length - 1) {
        s += values[i]
      }
      return s
    })
    .join('')

  // Minifiy
  result = result
    .replace(/\s+/g, ' ') // Replace all whitespace sequences with a single space
    .replace(/\s*([{}:;])\s*/g, '$1') // Remove space around {, }, :, ;
    .trim() // Trim any leading/trailing whitespace

  // Avoid duplicated CSS, in order to reduce KB size of HTML
  if (!globalObject.stopDedupe) {
    const res = globalObject.alreadyGenerated[result]
    if (res) return '/*already-generated*/'
    globalObject.alreadyGenerated[result] = true
  }

  return result
}

function cssStopDedupe() {
  globalObject.stopDedupe = true
}
function cssResetDedupe() {
  globalObject.alreadyGenerated = {}
}
