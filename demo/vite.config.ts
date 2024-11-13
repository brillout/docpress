import config from '@brillout/docpress/vite-config'
// Needed because when @brillout/docpress is linked then Vite treat it as user-land
config.optimizeDeps!.include!.push(...['@docsearch/react'])
export default config
