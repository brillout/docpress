export { CodeSnippets, CodeSnippet, TypescriptOnly }

import React, { useState } from 'react'
import { useSelectCodeLang } from './CodeSnippets/useSelectCodeLang'
import { assertWarning } from '../utils/assert'

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

  const displayStyle = tsOnly ? {} : { display: codeLangSelected === codeLang ? 'block' : 'none' }

  return (
    <div style={{ ...displayStyle, position: 'relative' }}>
      <ButtonCopyToClipboard />
      {children}
    </div>
  )
}

// Show/hide TypeScript sections (code and/or plain)
function TypescriptOnly({ children }: { children: React.ReactNode }) {
  const [codeLangSelected] = useSelectCodeLang()
  return <div style={{ display: codeLangSelected === 'ts' ? 'block' : 'none' }}>{children}</div>
}

function ButtonCopyToClipboard() {
  const tooltipInit = 'Copy to clipboard'
  let [tooltip, setTooltip] = useState(tooltipInit)
  const show = (msg: string) => {
    setTooltip(msg)
    setTimeout(() => setTooltip(tooltipInit), 850)
  }
  return (
    <button
      aria-label={tooltip}
      aria-label-position="top"
      type="button"
      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3 }}
      onClick={onClick}
    >
      Copy
    </button>
  )
  function onSuccess() {
    show('Copied ✅')
  }
  function onError(error: unknown) {
    console.error(error)
    const msg = 'Copy to clipboard failed ❌'
    show('Copy to clipboard failed')
    assertWarning(false, msg)
  }
  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      await copyToClipboard(e)
      onSuccess()
    } catch (error) {
      onError(error)
    }
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
