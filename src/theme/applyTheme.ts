export { applyTheme }
export { applyTheme_SSR }
export { setThemePreference }
export { initThemeListener }
export type { ThemePreference }

type ThemePreference = 'light' | 'dark' | 'system'

// Inlined in <head> (`applyTheme_SSR`), so that the page is painted with the right appearance: no flash of the wrong theme.
// - WARNING: We cannot use TypeScript here because we serialize the function.
// - The toggle's icon is picked by CSS from `data-theme-preference`, so the server-rendered HTML doesn't depend on the preference (no hydration mismatch).
const applyTheme_SSR = `applyTheme();${applyTheme.toString()}`
function applyTheme() {
  let preference = 'system'
  try {
    preference = localStorage.getItem('docpress:theme') || 'system'
  } catch {}
  if (preference !== 'light' && preference !== 'dark') preference = 'system'
  const isDark =
    preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme-preference', preference)
}

function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem('docpress:theme')
    else localStorage.setItem('docpress:theme', preference)
  } catch {}
  applyTheme()
}

function initThemeListener() {
  // Follow the OS while the preference is `system`
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme())
  // Keep other tabs in sync
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'docpress:theme') applyTheme()
  })
}
