export { CodeGroup }

import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { assertUsage } from '../../utils/assert'
import { cls } from '../../utils/cls'
import './CodeGroup.css'

function CodeGroup({ children, groupName }: { children: React.ReactNode, groupName: string }) {
  const pageContext = usePageContext()
  const { choices: c } = pageContext.globalContext.config.docpress
  assertUsage(c && c[groupName], `+docpress.choices['${groupName}'] is not defined in +docpress.choices`)

  const { choices, defaultChoice, persistId } = c[groupName]
  const childrenCount = React.Children.toArray(children).length
  assertUsage(childrenCount === choices.length, `expected ${choices.length} children, but got ${childrenCount}.`)

  const [hasJsToggle, setHasJsToggle] = useState(false)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(persistId, defaultChoice)
  const codeGroupRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  useEffect(() => {
    if (!codeGroupRef.current) return
    const selectedChoiceEl = codeGroupRef.current.querySelector<HTMLDivElement>(`div[id="${selectedChoice}"]`)
    setHasJsToggle(!!selectedChoiceEl?.classList.contains('has-toggle'))
  }, [selectedChoice])

  return (
    <div ref={codeGroupRef} data-key={persistId} className="code-group">
      <select
        name="select-choice"
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', hasJsToggle && 'has-toggle'])}
      >
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
    </div>
  )

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const el = e.target
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(el.value)
  }
}
