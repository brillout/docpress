export { ThemeToggle }

import React from 'react'
import { cycleThemePreference, themePreferences, type ThemePreference } from './applyTheme.js'
import './ThemeToggle.css'

const labels: Record<ThemePreference, string> = {
  system: 'Theme: system',
  light: 'Theme: light',
  dark: 'Theme: dark',
}

// All three icons are rendered; CSS shows the one matching `data-theme-preference`.
function ThemeToggle() {
  return (
    <button type="button" className="theme-toggle colorize-on-hover" onClick={cycleThemePreference}>
      {themePreferences.map((preference) => (
        <span key={preference} className={`theme-toggle-icon theme-toggle-${preference}`}>
          <span className="sr-only">{labels[preference]}</span>
          {icons[preference]}
        </span>
      ))}
    </button>
  )
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 17,
  height: 17,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const
const icons: Record<ThemePreference, React.JSX.Element> = {
  system: (
    <svg {...svgProps}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  light: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg {...svgProps}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
}
