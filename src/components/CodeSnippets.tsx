export { CodeSnippets, CodeSnippet, TypescriptOnly }

import React from 'react'
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
  return (
    <div
      style={{
        position: 'relative',
        display: !tsOnly ? undefined : codeLangSelected === codeLang ? 'block' : 'none',
      }}
    >
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
  return (
    <button
      type="button"
      style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3 }}
      onClick={async (e) => {
        try {
          await copyToClipboard(e)
          onSuccess()
        } catch (error) {
          onError(error)
        }
      }}
    >
      Copy
    </button>
  )
  function onSuccess() {
    console.log('Copied to clipboard!')
  }
  function onError(error: unknown) {
    console.error(error)
    assertWarning(false, 'Copy to clipboard failed')
  }
}

async function copyToClipboard(e: React.MouseEvent<HTMLButtonElement>) {
  const figureEl = e.currentTarget.nextElementSibling
  if (figureEl?.tagName === 'FIGURE') {
    let text = figureEl.textContent ?? ''
    text = removeTrailingWhitespace(text)
    await navigator.clipboard.writeText(text)
  }
}

function removeTrailingWhitespace(text: string) {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}
