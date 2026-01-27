import { assert } from './assert.js'

export { determineSectionUrlHash }
export { determineSectionTitle }

function determineSectionUrlHash(title: string): string | null {
  title = title.toLowerCase()
  title = removeAccentsAndDiacritics(title)
  const urlHash = title
    // \u4E00-\u9FA5 are chinese characters, see https://github.com/brillout/docpress/pull/2
    .split(/[^a-z0-9\u4E00-\u9FA5]+/)
    .filter(Boolean)
    .join('-')

  // E.g. section is composed of only non-latin characters
  if (urlHash === '') return null

  return urlHash
}

// Remove accents/diacritics in a string in JavaScript
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
function removeAccentsAndDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function determineSectionTitle(urlWithHash: string): string {
  assert(urlWithHash.includes('#'), { urlWithHash })
  const parts = urlWithHash.split('#')
  const urlHash = parts[1]
  assert(urlHash, { urlWithHash })
  const title = urlHash
    .split('-')
    .map((word, i) => {
      if (i === 0) {
        return capitalizeFirstLetter(word)
      }
      return word
    })
    .join(' ')
  return title
}

function capitalizeFirstLetter(word: string): string {
  const firstChar = word[0]
  assert(firstChar, { word })
  return firstChar.toUpperCase() + word.slice(1)
}
