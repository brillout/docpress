export default {
  tolerateError,
}

function tolerateError({ logText }) {
  return [
    'Define Vike settings in +config.js instead of vite.config.js', // TODO/now: remove
    // [12:33:38.464][/demo/test-dev.test.ts][pnpm run dev][stderr] Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient, present in 'optimizeDeps.include'
    'Cannot optimize dependency: @brillout/docpress/renderer/onRenderClient',
    // [10:18:25.341][/demo/test-dev.test.ts][pnpm run dev][stderr] Cannot optimize dependency: @brillout/docpress/Layout, present in 'optimizeDeps.include'
    'Cannot optimize dependency: @brillout/docpress/Layout',
    /*
    warnings when minifying css:
▲ [WARNING] Transforming this CSS nesting syntax is not supported in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14") [unsupported-css-nesting]

    <stdin>:40:26:
      40 │     .collapsible-expanded &,
         ╵                           ^

  The nesting transform for this case must generate an ":is(...)" but the configured target environment does not support the ":is" pseudo-class.


▲ [WARNING] Transforming this CSS nesting syntax is not supported in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14") [unsupported-css-nesting]

    <stdin>:41:27:
      41 │     .collapsible-collapsed & {
         ╵                            ^

  The nesting transform for this case must generate an ":is(...)" but the configured target environment does not support the ":is" pseudo-class.
    */
    'Transforming this CSS nesting syntax is not supported',
  ].some((txt) => logText.includes(txt))
}
