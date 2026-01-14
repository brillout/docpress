export { CodeGroup }

import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { assertUsage } from '../../utils/assert'
import { cls } from '../../utils/cls'
import type { PageContext } from 'vike/types'
import './CodeGroup.css'

function CodeGroup({ children, choices }: { children: React.ReactNode, choices: string[] }) {
  const pageContext = usePageContext()
  const { groupName, group } = findGroup(pageContext, choices)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, group.default)
  const [hasJsToggle, setHasJsToggle] = useState(false)
  const codeGroupRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  useEffect(() => {
    if (!codeGroupRef.current) return
    const selectedChoiceEl = codeGroupRef.current.querySelector<HTMLDivElement>(`div[id="${selectedChoice}"]`)
    setHasJsToggle(!!selectedChoiceEl?.classList.contains('has-toggle'))
  }, [selectedChoice])

  return (
    <div ref={codeGroupRef} data-key={groupName} className="code-group">
      <select
        name="select-choice"
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', hasJsToggle && 'has-toggle'])}
      >
        {group.choices.map((choice, i) => (
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

function findGroup(pageContext: PageContext, choices: string[]) {
  const { choices: choicesGroup } = pageContext.globalContext.config.docpress
  assertUsage(choicesGroup, `+docpress.choices is not defined.`)

  const groupName = Object.keys(choicesGroup).find(
    (key) =>
      choicesGroup[key].choices.length === choices.length &&
      choicesGroup[key].choices.every((choice, i) => choice === choices[i]),
  )
  assertUsage(groupName, `the group name for [${choices}] was not found.`)

  return { groupName, group: choicesGroup[groupName] }
}
