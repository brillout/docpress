export { ChoiceGroup }

import React, { useState } from 'react'
import { useSelectedChoice } from '../hooks/useSelectedChoice.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

type TChoiceGroup = {
  name: string
  choices: string[]
  default: string
  disabled: string[]
}

function ChoiceGroup({
  children,
  choiceGroup,
  lvl,
  hide = false,
}: { children: React.ReactNode; choiceGroup: TChoiceGroup; lvl: number; hide: boolean }) {
  const { name: groupName, choices, default: defaultChoice, disabled: disabledChoices } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  const isDisabled = (choice: string) => disabledChoices.includes(choice)
  const selectedIndex = choices.indexOf(selectedChoice)

  const height = 25
  const [expanded, setExpanded] = useState(false)
  const rectTop = -selectedIndex * height

  // Cycle to next ENABLED option
  const next = () => {
    let nextIndex = selectedIndex

    for (let i = 0; i < choices.length; i++) {
      nextIndex = (nextIndex + 1) % choices.length
      if (!isDisabled(choices[nextIndex]!)) {
        setSelectedChoice(choices[nextIndex]!)
        return
      }
    }
  }

  return (
    <div data-choice-group={choiceGroup.name} className="choice-group">
      <div
        role="radiogroup"
        className={cls(['wrapper', hide && 'hidden'])}
        // aria-label="Select an option"
        style={{
          '--lvl': lvl,
          height: height,
          overflow: expanded ? 'visible' : 'hidden',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => {
          if (!expanded) next()
        }}
      >
        <div className="sliding-rectangle" style={{ top: rectTop, height: choices.length * height }}>
          {choices.map((choice, i) => {
            const disabled = isDisabled(choice)
            const selected = i === selectedIndex

            return (
              <label
                className="choice-label"
                key={i}
                aria-selected={selected}
                aria-disabled={disabled}
                style={{
                  height: height,
                  borderBottom: i !== choices.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  background: selected ? '#eee' : 'white',
                  color: disabled ? '#999' : '#000',
                  fontWeight: selected ? 500 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                }}
                onClick={(e) => {
                  if (selected) {
                    e.preventDefault()
                    next()
                  }
                }}
              >
                <input
                  className="choice-radio-input"
                  type="radio"
                  name="vertical-select"
                  value={choice}
                  checked={choices[i]! === selectedChoice}
                  onChange={(e) => setSelectedChoice(e.target.value)}
                  disabled={disabledChoices.includes(choice)}
                />
                {choice}
              </label>
            )
          })}
        </div>
      </div>
      {/* <select
        name={`choicesFor-${choiceGroup.name}`}
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', hide && 'hidden'])}
        style={{ '--lvl': lvl }}
      >
        {choiceGroup.choices.map((choice, i) => (
          <option key={i} value={choice} disabled={choiceGroup.disabled.includes(choice)}>
            {choice}
          </option>
        ))}
      </select> */}
      {children}
    </div>
  )

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const el = e.target
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(el.value)
  }
}
