import vike from 'vike/plugin'

export default {
  plugins: [
    // Used by the landing page, see `.svg?react` imports
    vike(),
  ],
  /* DEBUG
  build: { minify: false },
  //*/
  optimizeDeps: {
    include: ['@docsearch/react'],
  },
}
