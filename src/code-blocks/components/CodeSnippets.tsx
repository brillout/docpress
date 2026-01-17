// Public
export { TypescriptOnly }

// Internal
export { CodeSnippets }

import React from 'react'
import { useSelectCodeLang } from '../hooks/useSelectCodeLang'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import './CodeSnippets.css'

/** Only show if TypeScript is selected */
function TypescriptOnly({ children }: { children: React.ReactNode }) {
  const [codeLangSelected] = useSelectCodeLang()
  return <div style={{ display: codeLangSelected === 'ts' ? 'block' : 'none' }}>{children}</div>
}

function CodeSnippets({ children, hideToggle = false }: { children: React.ReactNode; hideToggle: boolean }) {
  const [codeLangSelected, selectCodeLang] = useSelectCodeLang()
  const prevPositionRef = useRestoreScroll([codeLangSelected])

  return (
    <div className="code-snippets">
      <input
        type="checkbox"
        name="code-lang-toggle"
        className="code-lang-toggle raised"
        style={{ display: hideToggle ? 'none' : undefined }}
        checked={codeLangSelected === 'ts'}
        onChange={onChange}
        title="Toggle language"
      />
      {children}
    </div>
  )
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const element = e.target
    prevPositionRef.current = { top: element.getBoundingClientRect().top, el: element }
    selectCodeLang(element.checked ? 'ts' : 'js')
  }
}
