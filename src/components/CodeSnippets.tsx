export { CodeSnippets, CodeSnippet, TypescriptOnly }

import React from 'react'
import { useSelectCodeLang } from './CodeSnippets/useSelectCodeLang'

function CodeSnippets({ children }: { children: React.ReactNode }) {
  const [codeLangSelected, selectCodeLang] = useSelectCodeLang()

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectCodeLang(e.target.value)
  }

  return (
    <div>
      <form style={{ position: 'relative' }}>
        <select
          id="code-lang-select"
          onChange={handleOnChange}
          value={codeLangSelected}
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
  const [codeLangSelected] = useSelectCodeLang()

  const style = tsOnly ? {} : { display: codeLangSelected === codeLang ? 'block' : 'none' }

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const figureEl = e.currentTarget.nextElementSibling
      if (figureEl?.tagName === 'FIGURE') {
        let text = figureEl.textContent ?? ''
        text = removeTrailingWhitespace(text)
        await navigator.clipboard.writeText(text)
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
  const [codeLangSelected] = useSelectCodeLang()

  return <div style={{ display: codeLangSelected === 'ts' ? 'block' : 'none' }}>{children}</div>
}

function removeTrailingWhitespace(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}
