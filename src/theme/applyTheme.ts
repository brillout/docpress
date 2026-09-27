export { applyTheme_SSR }
export { toggleTheme }
export { initThemeListener }

// Stored in localStorage `docpress:theme`; absent => follow the OS
type ThemePreference = 'light' | 'dark' | 'system'

// Inlined in <head> (`applyTheme_SSR`), so that the page is painted with the right appearance: no flash of the wrong theme.
// - WARNING: We cannot use TypeScript here because we serialize the function.
// - The toggle's icon is picked by CSS from the `dark` class, so the server-rendered HTML doesn't depend on the theme (no hydration mismatch).
const applyTheme_SSR = `applyTheme();${applyTheme.toString()}`
// `preferenceInMemory`: the user's pick when it couldn't be persisted (e.g. storage disabled or full)
function applyTheme(preferenceInMemory?: string) {
  let preference = preferenceInMemory || 'system'
  if (!preferenceInMemory) {
    try {
      preference = localStorage.getItem('docpress:theme') || 'system'
    } catch {}
  }
  const isDark =
    preference === 'dark' || (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

// Switches to the other appearance; switching back to the OS's appearance follows the OS again
function toggleTheme() {
  const isDark = !document.documentElement.classList.contains('dark')
  const isDarkOs = window.matchMedia('(prefers-color-scheme: dark)').matches
  setThemePreference(isDark === isDarkOs ? 'system' : isDark ? 'dark' : 'light')
}

let preferenceInMemory: ThemePreference | undefined
function setThemePreference(preference: ThemePreference) {
  preferenceInMemory = preference
  try {
    if (preference === 'system') localStorage.removeItem('docpress:theme')
    else localStorage.setItem('docpress:theme', preference)
    preferenceInMemory = undefined
  } catch {}
  switchTheme()
}
// Without transitions: every color changes in the same frame
function switchTheme() {
  const { classList } = document.documentElement
  classList.add('dp-theme-switching')
  applyTheme(preferenceInMemory)
  requestAnimationFrame(() => requestAnimationFrame(() => classList.remove('dp-theme-switching')))
}

let isListening = false
function initThemeListener() {
  if (isListening) return
  isListening = true
  // Follow the OS while the preference is `system`
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', switchTheme)
  // Keep other tabs in sync (`key === null` => the storage was cleared)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'docpress:theme' || ev.key === null) switchTheme()
  })
}
