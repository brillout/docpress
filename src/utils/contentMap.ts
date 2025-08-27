import { createHash } from 'node:crypto'

export type ContentMap = {
  /**
   * @returns key
   */
  add(title: string, sourceLength: number, content: string): string
  get(key: string): string | undefined
}

export const createContentMap = (): ContentMap => {
  const map = new Map<string, string>()

  return {
    add(title, length, content) {
      const key = generateKey(`${title}_${length}`)
      if (!map.has(key)) {
        map.set(key, content)
      }
      return key
    },
    get(key) {
      const val = map.get(key)
      return val
    },
  }
}

const generateKey = (value: string) => {
  const hash = createHash('md5').update(value).digest('hex')
  return `#_#_${hash}_#_#`
}

export const contentMapKeyRE = /#_#_[0-9a-fA-F]{32}_#_#/g
