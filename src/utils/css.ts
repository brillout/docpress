export function css(strings: TemplateStringsArray | string[], ...values: (string | number)[]): string {
  // The boring part: just concatenate
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

  return result
}
