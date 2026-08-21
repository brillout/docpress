// This file isn't a `+` file, so Vike never loads it: it exists only so that
// `pnpm run test:types` covers DocPress's public entries — including the ones that don't
// resolve to TypeScript files and therefore need an explicit `types` export condition.

import '@brillout/docpress/style'
