export default {
  tolerateError,
}

function tolerateError({ logText }) {
  return [
    //
    'has been externalized for browser compatibility',
    // TOOD: remove once Vike's `main` branch is released.
    // [vike][Warning] /pages/+config.ts uses extends to inherit from /home/runner/work/docpress/docpress/src/dist/+config.js which is a user-land file: this is experimental and may be remove at any time. Reach out to a maintainer if you need this.
    'which is a user-land file: this is experimental and may be remove at any time. Reach out to a maintainer if you need this.',
  ].some((txt) => logText.includes(txt))
}
