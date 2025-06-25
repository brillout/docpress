export { addScript }

import { genPromise } from './genPromise'

async function addScript(src: string) {
  const { promise, resolve, reject } = genPromise()
  const script = document.createElement('script')
  script.onload = () => resolve()
  script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
  script.src = src
  document.head.appendChild(script)
  return promise
}
