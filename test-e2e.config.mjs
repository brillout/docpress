export default {
  tolerateError,
}

function tolerateError({ logText }) {
  return [
    //
    'has been externalized for browser compatibility',
  ].some((txt) => logText.includes(txt))
}
