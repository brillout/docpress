export { ThemeToggle }

import React from 'react'
import { toggleTheme } from './applyTheme.js'
import { cls } from '../utils/cls.js'
import './ThemeToggle.css'

// Both icons are rendered; CSS shows the current appearance's
function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cls(['theme-toggle', className])}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <svg {...svgProps} className="theme-toggle-icon theme-toggle-light">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg {...svgProps} className="theme-toggle-icon theme-toggle-dark">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  )
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const
