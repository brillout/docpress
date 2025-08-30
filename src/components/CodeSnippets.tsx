export { CodeSnippets, CodeSnippet, TypescriptOnly }

import React from 'react'
import { useSelectCodeLang } from './CodeSnippets/useSelectCodeLang'

function CodeSnippets({ children }: { children: React.ReactNode }) {
  const [selectedLang, setSelectedLang] = useSelectCodeLang()

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value)
  }

  return (
    <div>
      <form style={{ position: 'relative' }}>
        <select
          id="code-lang-select"
          onChange={handleOnChange}
          value={selectedLang}
          style={{ position: 'absolute', top: '10px', right: '60px', zIndex: 3 }}
        >
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
        </select>
      </form>
      {children}
    </div>
  )
}

function CodeSnippet({
  children,
  codeLang,
  tsOnly = false,
}: { children: React.ReactNode; codeLang: string; tsOnly: boolean }) {
  const [selectedLang] = useSelectCodeLang()

  const style = tsOnly ? {} : { display: selectedLang === codeLang ? 'block' : 'none' }

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
  const [selectedLang] = useSelectCodeLang()

  return <div style={{ display: selectedLang === 'ts' ? 'block' : 'none' }}>{children}</div>
}
