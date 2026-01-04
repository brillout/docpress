export { CodeGroup }

import React, { useEffect, useRef, useState } from 'react'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { cls } from '../../utils/cls'
import './CodeGroup.css'

type CodeChoiceProps = {
  children: React.ReactNode
  group: {
    choices: string[]
    defaultChoice: string | null
    persistId: string | null
  }
}

function CodeGroup({ children, group }: CodeChoiceProps) {
  const { choices, defaultChoice, persistId } = group
  const [hasJsToggle, setHasJsToggle] = useState(false)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(persistId, defaultChoice || choices[0])
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
