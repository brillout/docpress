export { ChoiceGroup }

import React, { useEffect, useRef, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext'
import { useSelectedChoice } from '../hooks/useSelectedChoice'
import { useRestoreScroll } from '../hooks/useRestoreScroll'
import { assertUsage } from '../../utils/assert'
import { cls } from '../../utils/cls'
import type { PageContext } from 'vike/types'
import './ChoiceGroup.css'

function ChoiceGroup({
  children,
  choices,
  hide = false,
}: { children: React.ReactNode; choices: string[]; hide: boolean }) {
  const pageContext = usePageContext()
  const group = findGroup(pageContext, choices)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(group.name, group.default)
  const [hasJsToggle, setHasJsToggle] = useState(false)
  const choiceGroupRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const isHidden = choices.length === 1 || !choices.includes(selectedChoice) || hide

  useEffect(() => {
    if (!choiceGroupRef.current) return
    const selectedChoiceEl = choiceGroupRef.current.querySelector<HTMLDivElement>(`div[data-id="${selectedChoice}"]`)
    setHasJsToggle(!!selectedChoiceEl?.classList.contains('has-js-dropdown'))
  }, [selectedChoice])

  return (
    <div ref={choiceGroupRef} data-group-name={group.name} className={'choice-group'}>
      <select
        name={`${group.name}-choices`}
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', hasJsToggle && 'show-js-dropdown', isHidden && 'hidden'])}
      >
        {group.choices.map((choice, i) => (
          <option key={i} value={choice} disabled={!choices.includes(choice)}>
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

  const groupName = Object.keys(choicesGroup).find((key) => {
    // get only the values that exist in both choices and choicesGroup[key].choices
    const relevantChoices = choicesGroup[key].choices.filter((choice) => choices.includes(choice))
    // if nothing exists, skip this key
    if (relevantChoices.length === 0) return false

    // check order
    let i = 0
    for (const choice of choices) {
      if (choice === relevantChoices[i]) i++
    }
    assertUsage(
      i === relevantChoices.length,
      `Choices exist for key "${key}" but NOT in order. Expected order: [${relevantChoices}], got: [${choices}]`,
    )

    return true
  })
  assertUsage(groupName, `the group name for [${choices}] was not found.`)

  const mergedChoices = [...new Set([...choices, ...choicesGroup[groupName].choices])]

  const group = {
    name: groupName,
    ...choicesGroup[groupName],
    choices: mergedChoices,
  }

  return group
}
