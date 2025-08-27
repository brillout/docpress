export { CodeSnippets, CodeSnippet, TypescriptOnly }

import React from 'react'
import { useSelectedLanguage } from '../utils/useSelectedLanguage'

function CodeSnippets({ children }: { children: React.ReactNode }) {
  const [selectedLang, setSelectedLang] = useSelectedLanguage()

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value)
  }

  return (
    <div>
      <form style={{ position: 'relative' }}>
        <select
          name="language"
          id="language"
          onChange={handleOnChange}
          value={selectedLang}
          style={{ position: 'absolute', top: '10px', right: '60px', zIndex: 3 }}
        >
          <option value="js">Javascript</option>
          <option value="ts">Typescript</option>
        </select>
      </form>
      {children}
    </div>
  )
}

function CodeSnippet({
  children,
  language,
  tsOnly = false,
}: { children: React.ReactNode; language: string; tsOnly: boolean }) {
  const [selectedLang] = useSelectedLanguage()

  const style = tsOnly ? {} : { display: selectedLang === language ? 'block' : 'none' }

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const figureEl = e.currentTarget.nextElementSibling
      if (figureEl?.tagName === 'FIGURE') {
        await navigator.clipboard.writeText(figureEl.textContent ?? '')
        console.log('Copied to clipboard!')
      }
    } catch (error) {
      console.warn('Copy failed', error)
    }
  }

  return (
    <div style={{ ...style, position: 'relative' }}>
      <button
        type="button"
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3 }}
        onClick={copyToClipboard}
      >
        Copy
      </button>
      {children}
    </div>
  )
}

// Show/hide TypeScript sections (code and/or plain)
function TypescriptOnly({ children }: { children: React.ReactNode }) {
  const [selectedLang] = useSelectedLanguage()

  return <div style={{ display: selectedLang === 'ts' ? 'block' : 'none' }}>{children}</div>
}
