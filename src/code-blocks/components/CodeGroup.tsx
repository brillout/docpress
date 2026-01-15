export { CodeGroup }

import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { assertUsage } from '../../utils/assert'
import { cls } from '../../utils/cls'
import type { PageContext } from 'vike/types'
import './CodeGroup.css'

function CodeGroup({ children, choices }: { children: React.ReactNode; choices: string[] }) {
  const pageContext = usePageContext()
  const singleChoice = choices.length === 1
  const group = findGroup(pageContext, choices)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(group.name, group.default)
  const [hasJsToggle, setHasJsToggle] = useState(false)
  const codeGroupRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  useEffect(() => {
    if (!codeGroupRef.current) return
    const selectedChoiceEl = codeGroupRef.current.querySelector<HTMLDivElement>(`div[id="${selectedChoice}"]`)
    setHasJsToggle(!!selectedChoiceEl?.classList.contains('has-toggle'))
  }, [selectedChoice])

  return (
    <div ref={codeGroupRef} data-group-name={group.name} className="code-group">
      {singleChoice ? (
        <input
          type="checkbox"
          name={`${group.name}-${choices[0]}`}
          className="single-choice"
          checked={selectedChoice === choices[0]}
          style={{ display: 'none' }}
          readOnly
        />
      ) : (
        <select
          name={`${group.name}-choices`}
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
      )}
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

  const groupName = Object.keys(choicesGroup).find((key) => {
    if (choices.length === 1) {
      return choicesGroup[key].choices.some((choice) => choice === choices[0])
    }
    return (
      choicesGroup[key].choices.length === choices.length &&
      choicesGroup[key].choices.every((choice, i) => choice === choices[i])
    )
  })
  assertUsage(groupName, `the group name for [${choices}] was not found.`)

  return { name: groupName, ...choicesGroup[groupName] }
}
