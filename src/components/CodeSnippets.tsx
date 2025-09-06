// Public
export { TypescriptOnly }

// Internal
export { CodeSnippets }
export { CodeSnippet }

import React, { useState } from 'react'
import { useSelectCodeLang } from './CodeSnippets/useSelectCodeLang'
import './CodeSnippets.css'

/** Only show if TypeScript is selected */
function TypescriptOnly({ children }: { children: React.ReactNode }) {
  const [codeLangSelected] = useSelectCodeLang()
  return <div style={{ display: codeLangSelected === 'ts' ? 'block' : 'none' }}>{children}</div>
}

function CodeSnippets({ children }: { children: React.ReactNode }) {
  const [codeLangSelected, selectCodeLang] = useSelectCodeLang()
  return (
    <div className="code-snippets">
      <form style={{ position: 'relative' }}>
        <select className="code-lang-select" onChange={onChange} value={codeLangSelected}>
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
        </select>
      </form>
      {children}
    </div>
  )
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    selectCodeLang(e.target.value)
  }
}

function CodeSnippet({
  children,
  codeLang,
  tsOnly = false,
}: { children: React.ReactNode; codeLang: string; tsOnly: boolean }) {
  const [codeLangSelected] = useSelectCodeLang()

  const displayStyle = tsOnly ? {} : { display: codeLangSelected === codeLang ? 'block' : 'none' }

  return (
    <div className="code-snippet" style={{ ...displayStyle }}>
      <CopyButton />
      {children}
    </div>
  )
}

function CopyButton() {
  const [isSuccess, setIsSuccess] = useState(null as null | boolean)
  const onCopy = (success: boolean) => {
    setIsSuccess(success)
    setTimeout(() => {
      setIsSuccess(null)
    }, 900)
  }
  const tooltip = isSuccess === null ? 'Copy to clipboard' : isSuccess ? 'Copied' : 'Failed'
  const text =
    isSuccess === null ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    ) : isSuccess ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#28a745" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      '❌'
    )
  return (
    <button className="copy-button" aria-label={tooltip} data-label-position="top" type="button" onClick={onClick}>
      {text}
    </button>
  )
  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    let success: boolean
    try {
      await copyToClipboard(e)
      success = true
    } catch (error) {
      console.error(error)
      success = false
    }
    onCopy(success)
  }
}

async function copyToClipboard(e: React.MouseEvent<HTMLButtonElement>) {
  const figureEl = e.currentTarget.nextElementSibling
  if (figureEl?.tagName === 'FIGURE') {
    let text = figureEl.textContent ?? ''
    text = removeTrailingWhitespaces(text)
    await navigator.clipboard.writeText(text)
  }
}

function removeTrailingWhitespaces(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}
