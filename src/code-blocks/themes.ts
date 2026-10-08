export { highlighterTheme }

import githubLight from 'shiki/themes/github-light-default.mjs'
import githubDark from 'shiki/themes/github-dark-default.mjs'
import type { ThemeRegistration } from 'shiki'

// The surfaces code text sits on (keep in sync with src/css/tokens.css): the well (`--dp-color-code-bg`), and the well
// under the tint of highlighted lines and of diff lines (`--dp-color-code-highlight`, `--dp-color-diff-*-bg`)
const codeBackgrounds = {
  light: { well: '#ebebe9', highlighted: '#e0e0de', diffAdd: '#e1f0e6', diffRemove: '#fce4e2' },
  dark: { well: '#111317', highlighted: '#24262a', diffAdd: '#15281e', diffRemove: '#3f1f21' },
}

// GitHub's themes, with every token color adjusted (hue kept) to be readable on all of these surfaces: WCAG AA (4.5:1).
// Both are emitted as CSS variables (--shiki-light / --shiki-dark), see src/css/code.css
const highlighterTheme = {
  light: withContrast(githubLight, 'docpress-light', codeBackgrounds.light, '#000000'),
  dark: withContrast(githubDark, 'docpress-dark', codeBackgrounds.dark, '#ffffff'),
}

function withContrast(
  theme: ThemeRegistration,
  name: string,
  backgrounds: Record<string, string> & { well: string },
  towards: string,
): ThemeRegistration {
  const adjust = (color: string | undefined) =>
    color ? ensureContrast(color, Object.values(backgrounds), towards) : color
  return {
    ...theme,
    name,
    colors: {
      ...theme.colors,
      'editor.background': backgrounds.well,
      'editor.foreground': adjust(theme.colors?.['editor.foreground'])!,
    },
    tokenColors: theme.tokenColors?.map((tokenColor) => ({
      ...tokenColor,
      settings: { ...tokenColor.settings, foreground: adjust(tokenColor.settings.foreground) },
    })),
  }
}

// Mixes `color` towards black (light theme) / white (dark theme) until it reaches 4.5:1 on every background
function ensureContrast(color: string, backgrounds: string[], towards: string): string {
  const rgb = parseHex(color)
  if (!rgb) return color
  const bgs = backgrounds.map((background) => parseHex(background)!)
  const target = parseHex(towards)!
  for (let amount = 0; amount <= 1; amount += 0.01) {
    const mixed = rgb.map((c, i) => c + (target[i]! - c) * amount) as Rgb
    if (bgs.every((bg) => contrast(mixed, bg) >= 4.5)) return toHex(mixed)
  }
  return towards
}

type Rgb = [number, number, number]
function parseHex(color: string): Rgb | null {
  // `#rgb`, `#rrggbb` (colors with an alpha channel are kept as is)
  const hex = color.replace('#', '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb
}
function toHex(rgb: Rgb): string {
  return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}
function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: Rgb, b: Rgb): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}
