export { isBrowser }

function isBrowser() {
  return typeof window !== 'undefined'
}
