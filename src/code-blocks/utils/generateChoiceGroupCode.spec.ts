import { describe, it, expect } from 'vitest'
import { resolveChoiceGroupName, CHOICES_BUILT_IN } from './generateChoiceGroupCode.js'
import type { Config } from '../../types/Config.js'

// Build a choice group from a list of value names (icons are irrelevant to resolution).
const group = (...names: string[]): NonNullable<Config['choices']>[string] => ({
  choices: names.map((name) => ({ name, icon: '' })),
  default: names[0]!,
})

describe('resolveChoiceGroupName', () => {
  // A custom `runtime` group that collides with the built-in `pkgManager` on `Bun`,
  // plus a `server` group whose values are typically authored as a subset on a page.
  const choicesConfig = {
    runtime: group('Node', 'Bun', 'Deno', 'Cloudflare'),
    server: group('Hono', 'Express', 'Fastify', 'h3'),
  }
  const choicesAll = { ...CHOICES_BUILT_IN, ...choicesConfig }

  it('resolves a custom group that overlaps a built-in (Bun/pkgManager) to the custom group', () => {
    // Regression: this block shares `Bun` with the built-in `pkgManager`, but is a complete
    // match of `runtime`. It must resolve to `runtime`, not `pkgManager`.
    expect(resolveChoiceGroupName(['Node', 'Bun', 'Deno', 'Cloudflare'], choicesAll)).toBe('runtime')
  })

  it('leaves the built-in pkgManager block unchanged despite the colliding runtime group', () => {
    // The block remarkPkgManager generates must still resolve to `pkgManager`, even though
    // `runtime` also contains `Bun` (pkgManager is the complete match here).
    expect(resolveChoiceGroupName(['npm', 'pnpm', 'Bun', 'Yarn'], choicesAll)).toBe('pkgManager')
  })

  it('leaves the built-in codeLang block unchanged', () => {
    expect(resolveChoiceGroupName(['JavaScript', 'TypeScript'], choicesAll)).toBe('codeLang')
  })

  it('resolves a block authored with only a subset of a group to that group', () => {
    // A page may author only some of a group's values; the unused values become emptyChoices.
    expect(resolveChoiceGroupName(['Hono', 'Express'], choicesAll)).toBe('server')
  })

  it('prefers the larger overlap when no group is a complete match', () => {
    // Values spanning two groups: no group provides all of them, so the largest overlap wins.
    // [npm, pnpm, Yarn, Node] overlaps pkgManager by 3 and runtime by 1.
    expect(resolveChoiceGroupName(['npm', 'pnpm', 'Yarn', 'Node'], choicesAll)).toBe('pkgManager')
  })

  it('returns undefined when no group provides any of the values (so assertUsage fires)', () => {
    expect(resolveChoiceGroupName(['DoesNotExist'], choicesAll)).toBeUndefined()
  })
})
