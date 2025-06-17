export default {
  tolerateError,
}

function tolerateError({ logText }) {
  return [
    // [12:33:38.464][/demo/test-dev.test.ts][pnpm run dev][stderr] Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient, present in 'optimizeDeps.include'
    'Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient',
    // [10:18:25.341][/demo/test-dev.test.ts][pnpm run dev][stderr] Cannot optimize dependency: @brillout/docpress/Layout, present in 'optimizeDeps.include'
    'Cannot optimize dependency: @brillout/docpress/Layout',
    // No internet connection =>
    // ```shell
    // [14:04:01.158][/test-preview.test.ts][pnpm run preview][Browser Error] Failed to load resource: net::ERR_INTERNET_DISCONNECTED
    // ```
    // ```browser
    // GET https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap net::ERR_INTERNET_DISCONNECTED
    // ```
    'ERR_INTERNET_DISCONNECTED',
  ].some((txt) => logText.includes(txt))
}
