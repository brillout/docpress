export { CodeGroup }

import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { assertUsage } from '../../utils/assert'
import { cls } from '../../utils/cls'
import type { PageContext } from 'vike/types'
import './CodeGroup.css'

function CodeGroup({ children }: { children: React.ReactNode }) {
  const pageContext = usePageContext()
  const { groupName, group } = findGroup(pageContext, children)
  const { choices, default: defaultChoice } = group
  const [hasJsToggle, setHasJsToggle] = useState(false)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
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

function findGroup(pageContext: PageContext, children: React.ReactNode) {
  const choiceIds = React.Children.toArray(children)
    .filter(React.isValidElement<{ id: string }>)
    .map((child) => child.props.id)
  const { choices: choicesGroup } = pageContext.globalContext.config.docpress
  assertUsage(choicesGroup, `+docpress.choices is not defined.`)

  const groupName = Object.keys(choicesGroup).find(
    (key) =>
      choicesGroup[key].choices.length === choiceIds.length &&
      choicesGroup[key].choices.every((choice, i) => choice === choiceIds[i]),
  )
  assertUsage(groupName, `+docpress.choices[${groupName}] is not defined.`)

  return { groupName, group: choicesGroup[groupName] }
}
