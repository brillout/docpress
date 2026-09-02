export { getHighlighter }
export { warmUpHighlighter }
export { highlighterTheme }

import { getHighlighter as getHighlighterShiki, bundledLanguagesBase } from 'shiki'
import type { BundledHighlighterOptions, BundledLanguage, BundledTheme, Highlighter, LanguageRegistration } from 'shiki'
import type { Plugin } from 'vite'

const highlighterTheme = 'github-light'
// The options Rehype Pretty Code passes to `getHighlighter()`, see `rehypePrettyCode()` in
// node_modules/rehype-pretty-code/dist/index.js
const highlighterOptions: BundledHighlighterOptions<BundledLanguage, BundledTheme> = {
  themes: [highlighterTheme],
  langs: ['plaintext'],
}

// Rehype Pretty Code loads grammars on-demand into a single highlighter that is shared by the client-side and
// server-side builds. Some grammars *lazily* embed other grammars, e.g. the markdown grammar lazily embeds the `yaml`
// grammar (for frontmatter) and most other grammars (for fenced code blocks): a lazily embedded grammar is used only if
// it happens to be already loaded.
//
// The highlighting of a ```md code block would thus depend on whether a ```yaml code block was processed before it —
// which differs between the client-side and server-side builds, leading to a hydration mismatch (React error #418).
//
// We make the highlighting deterministic by loading all grammars upfront (~0.5s and ~30MB, once per process).
const highlighters = new Map<string, Promise<Highlighter>>()
function getHighlighter(options: BundledHighlighterOptions<BundledLanguage, BundledTheme>): Promise<Highlighter> {
  const key = JSON.stringify(options)
  let highlighter = highlighters.get(key)
  if (!highlighter) {
    highlighter = createHighlighter(options)
    highlighters.set(key, highlighter)
  }
  return highlighter
}

async function createHighlighter(
  options: BundledHighlighterOptions<BundledLanguage, BundledTheme>,
): Promise<Highlighter> {
  const highlighter = await getHighlighterShiki(options)
  const langsAll = await Promise.all(
    Object.values(bundledLanguagesBase).map(async (importLang) => (await importLang()).default),
  )
  // We load the grammars that lazily embed other grammars (markdown, mdx, vue, ...) last: Shiki re-compiles such a
  // grammar each time one of its lazily embedded grammars is loaded.
  const hasLangsEmbeddedLazy = (langs: LanguageRegistration[]) => langs.some((lang) => lang.embeddedLangsLazy?.length)
  const langsOrdered = [
    ...langsAll.filter((langs) => !hasLangsEmbeddedLazy(langs)),
    ...langsAll.filter(hasLangsEmbeddedLazy),
  ]
  for (const langs of langsOrdered) await highlighter.loadLanguage(...langs)
  return highlighter
}

// We load the grammars before the build starts (instead of during the first MDX transform): Rolldown warns when
// plugins take a significant share of the build time, which the ~0.5s of grammar loading does for small builds.
function warmUpHighlighter(): Plugin {
  return {
    name: '@brillout/docpress:warmUpHighlighter',
    async configResolved() {
      await getHighlighter(highlighterOptions)
    },
  }
}
