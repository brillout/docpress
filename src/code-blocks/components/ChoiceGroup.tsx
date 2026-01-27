export { ChoiceGroup }

import React, { useRef } from 'react'
import { usePageContext } from '../../renderer/usePageContext.js'
import { useSelectedChoice } from '../hooks/useSelectedChoice.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { assertUsage } from '../../utils/assert.js'
import { cls } from '../../utils/cls.js'
import type { PageContext } from 'vike/types'
import './ChoiceGroup.css'

const CHOICES_BUILT_IN: Record<string, { choices: string[]; default: string }> = {
  codeLang: {
    choices: ['JavaScript', 'TypeScript'],
    default: 'JavaScript',
  },
  pkgManager: {
    choices: ['npm', 'pnpm', 'Bun', 'Yarn'],
    default: 'npm',
  },
}

function ChoiceGroup({
  children,
  choices,
  hide = false,
}: { children: React.ReactNode; choices: string[]; hide: boolean }) {
  const pageContext = usePageContext()
  const cleanChoices = choices.map((c) => c.split(':')[0]!)
  const choiceGroup = findChoiceGroup(pageContext, cleanChoices)
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(choiceGroup.name, choiceGroup.default!)
  const isJsDropdownVisible = choices.indexOf(`${selectedChoice}:jsDropdown`) !== -1
  const choiceGroupRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const isHidden = choices.length === 1 || !cleanChoices.includes(selectedChoice) || hide

  return (
    <div ref={choiceGroupRef} data-choice-group={choiceGroup.name} className="choice-group">
      <select
        name={`choicesFor-${choiceGroup.name}`}
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', isJsDropdownVisible && 'show-js-dropdown', isHidden && 'hidden'])}
      >
        {choiceGroup.choices.map((choice, i) => (
          <option key={i} value={choice} disabled={!cleanChoices.includes(choice)}>
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

function findChoiceGroup(pageContext: PageContext, choices: string[]) {
  const { choices: choicesConfig } = pageContext.globalContext.config.docpress
  const choicesAll = { ...CHOICES_BUILT_IN, ...choicesConfig }

  const groupName = Object.keys(choicesAll).find((key) => {
    // get only the values that exist in both choices and choicesAll[key].choices
    const relevantChoices = choicesAll[key]!.choices.filter((choice) => choices.includes(choice))
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
  assertUsage(groupName, `Missing group name for [${choices}]. Define it in +docpress.choices.`)

  const mergedChoices = [...new Set([...choices, ...choicesAll[groupName]!.choices])]

  const choiceGroup = {
    name: groupName,
    ...choicesAll[groupName]!,
    choices: mergedChoices,
  }

  return choiceGroup
}
