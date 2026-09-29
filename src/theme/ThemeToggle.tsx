export { ThemeToggle }

import React, { useEffect, useState } from 'react'
import { toggleTheme } from './applyTheme.js'
import { cls } from '../utils/cls.js'
import './ThemeToggle.css'

// Both icons are rendered; CSS shows the current appearance's. The switch's state is set after hydration (the
// server-rendered HTML doesn't depend on the appearance).
function ThemeToggle({ className }: { className?: string }) {
  const isDark = useIsDark()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className={cls(['theme-toggle scale-on-press', className])}
      onClick={toggleTheme}
      aria-label="Dark mode"
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

function useIsDark() {
  const [isDark, setIsDark] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
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
