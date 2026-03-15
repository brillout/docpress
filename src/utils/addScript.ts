export { addScript }

import { genPromise } from './genPromise.js'

async function addScript(src: string, attributes?: Record<string, string>) {
  const { promise, resolve, reject } = genPromise()
  const script = document.createElement('script')
  script.onload = () => resolve()
  script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
  script.src = src
  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      script.setAttribute(name, value)
    }
  }
  document.head.appendChild(script)
  return promise
}
