import { assert } from './assert'

export { determineSectionUrlHash }
export { determineSectionTitle }

function determineSectionUrlHash(title: string): string | null {
  const urlHash = title
    .toLowerCase()
    // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-')

  // E.g. section is composed of only Chinese characters
  if (urlHash === '') return null

  return urlHash
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
