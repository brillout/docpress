export default {
  tolerateError,
}

function tolerateError({ logText }) {
  return [
    // [12:33:38.464][/demo/test-dev.test.ts][pnpm run dev][stderr] Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient, present in 'optimizeDeps.include'
    'Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient',
  ].some((txt) => logText.includes(txt))
}
