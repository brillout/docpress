import { assert } from './assert'

export { determineSectionUrlHash }
export { determineSectionTitle }

function determineSectionUrlHash(title: string): string | null {
  // title = title.toLowerCase()
  title = removeAccentsAndDiacritics(title)

  const charSeperator = '_'

  // https://github.com/brillout/docpress/pull/2
  const charChinese = '\u4E00-\u9FA5'
  // Url hash allowed characters: https://stackoverflow.com/questions/26088849/url-fragment-allowed-characters
  // E.g. for http://vite-plugin-ssr.com/migration/v1-design#what-are-+-files
  const charSpecial = "?/:@.\\-~!$&'()*+,;="
  assert(!charSpecial.includes(charSeperator))
  const charAllowed = `A-Za-z0-9${charSpecial}${charChinese}`

  const urlHash = title
    .split(new RegExp(`[^${charAllowed}]+`))
    .filter(Boolean)
    .join(charSeperator)

  // E.g. section is composed of only non-latin characters
  if (urlHash === '') return null

  return urlHash
}

// Remove accents/diacritics in a string in JavaScript
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
function removeAccentsAndDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function determineSectionTitle(urlWithHash: string, titleNormalCase: boolean): string {
  assert(urlWithHash.includes('#'), { urlWithHash })
  const urlHash = urlWithHash.split('#')[1]
  const title = urlHash
    .split('-')
    .map((word, i) => {
      if (i === 0) {
        return capitalizeFirstLetter(word)
      }
      if (!titleNormalCase && word.length >= 4) {
        return capitalizeFirstLetter(word)
      }
      return word
    })
    .join(' ')
  return title
}

function capitalizeFirstLetter(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}
