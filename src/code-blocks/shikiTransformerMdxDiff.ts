export { shikiTransformerMdxDiff }

import type { ShikiTransformer } from 'shiki'

const markerLineRE = /(\s*)(?:\/\/\s*\[!code\s*(\+\+|--)\]|\{\/\*\s*\[!code\s*(\+\+|--)\]\s*\*\/\})\s*$/
const markerOnlyLineRE = /^\s*\{\/\*\s*\[!code\s*(\+\+|--)\]\s*\*\/\}\s*$/
const markerTypeBySign = {
  '++': 'add',
  '--': 'remove',
} as const

type MarkerType = (typeof markerTypeBySign)[keyof typeof markerTypeBySign]
const markerLinesMetaKey = '__docpress_mdx_diff_lines'

/**
 * Workaround for Shiki not parsing diff notations in MDX code blocks:
 * https://github.com/shikijs/shiki/issues/770
 */
function shikiTransformerMdxDiff(): ShikiTransformer {
  return {
    name: 'docpress-shiki-mdx-diff',
    preprocess(code) {
      if (this.options.lang !== 'mdx') return

      const markerLines: Record<number, MarkerType> = {}
      const cleanedLines: string[] = []
      let markerForNextLine: MarkerType | null = null

      code.split('\n').forEach((line) => {
        const markerOnlyMatch = line.match(markerOnlyLineRE)
        if (markerOnlyMatch) {
          const sign = markerOnlyMatch[1] as keyof typeof markerTypeBySign
          markerForNextLine = markerTypeBySign[sign]
          return
        }

        let markerType = markerForNextLine
        markerForNextLine = null

        const lineWithMarkerRemoved = line.replace(markerLineRE, (_, leadingWhitespace, addMarker, removeMarker) => {
          const sign = (addMarker || removeMarker) as keyof typeof markerTypeBySign
          markerType = markerTypeBySign[sign]
          return leadingWhitespace
        })

        cleanedLines.push(lineWithMarkerRemoved)
        if (markerType) {
          markerLines[cleanedLines.length] = markerType
        }
      })

      const meta = this.meta as Record<string, unknown>
      meta[markerLinesMetaKey] = markerLines
      return cleanedLines.join('\n')
    },
    pre(pre) {
      if (this.options.lang !== 'mdx') return
      const markerLines = (this.meta as Record<string, unknown>)[markerLinesMetaKey] as
        | Record<number, MarkerType>
        | undefined
      if (!markerLines || Object.keys(markerLines).length === 0) return
      return this.addClassToHast(pre, 'has-diff')
    },
    line(line, lineNumber) {
      if (this.options.lang !== 'mdx') return
      const markerLines = (this.meta as Record<string, unknown>)[markerLinesMetaKey] as
        | Record<number, MarkerType>
        | undefined
      const markerType = markerLines?.[lineNumber]
      if (!markerType) return
      return this.addClassToHast(line, markerType === 'add' ? 'diff add' : 'diff remove')
    },
  }
}
