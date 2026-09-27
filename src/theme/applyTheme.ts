export { applyTheme }
export { applyTheme_SSR }
export { cycleThemePreference }
export { themePreferences }
export { initThemeListener }
export type { ThemePreference }

type ThemePreference = 'light' | 'dark' | 'system'
// The toggle's order
const themePreferences: ThemePreference[] = ['system', 'light', 'dark']

// Inlined in <head> (`applyTheme_SSR`), so that the page is painted with the right appearance: no flash of the wrong theme.
// - WARNING: We cannot use TypeScript here because we serialize the function.
// - The toggle's icon is picked by CSS from `data-theme-preference`, so the server-rendered HTML doesn't depend on the preference (no hydration mismatch).
const applyTheme_SSR = `applyTheme();${applyTheme.toString()}`
// `preferenceInMemory`: the user's pick when it couldn't be persisted (e.g. storage disabled or full)
function applyTheme(preferenceInMemory?: string) {
  let preference = preferenceInMemory || 'system'
  if (!preferenceInMemory) {
    try {
      preference = localStorage.getItem('docpress:theme') || 'system'
    } catch {}
  }
  if (preference !== 'light' && preference !== 'dark') preference = 'system'
  const isDark =
    preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme-preference', preference)
}

function cycleThemePreference() {
  const current = (document.documentElement.getAttribute('data-theme-preference') ?? 'system') as ThemePreference
  const next = themePreferences[(themePreferences.indexOf(current) + 1) % themePreferences.length]!
  setThemePreference(next)
}

let preferenceInMemory: ThemePreference | undefined
function setThemePreference(preference: ThemePreference) {
  preferenceInMemory = preference
  try {
    if (preference === 'system') localStorage.removeItem('docpress:theme')
    else localStorage.setItem('docpress:theme', preference)
    preferenceInMemory = undefined
  } catch {}
  applyTheme(preferenceInMemory)
}

let isListening = false
function initThemeListener() {
  if (isListening) return
  isListening = true
  // Follow the OS while the preference is `system`
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(preferenceInMemory))
  // Keep other tabs in sync (`key === null` => the storage was cleared)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'docpress:theme' || ev.key === null) applyTheme(preferenceInMemory)
  })
}
