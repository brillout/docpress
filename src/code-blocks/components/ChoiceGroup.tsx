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

  const height = 25
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const rectTop = -selectedIndex * height

  const next = () => setSelectedIndex((s) => (s + 1) % choices.length)

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
          {choices.map((choice, i) => (
            <label
              className="choice-label"
              key={i}
              style={{
                height: height,
                borderBottom: i !== choices.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                background: i === selectedIndex ? '#eee' : 'white',
              }}
              onClick={(e) => {
                if (i === selectedIndex) {
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
                checked={i === selectedIndex}
                onChange={() => setSelectedIndex(i)}
                disabled={disabledChoices.includes(choice)}
              />
              {choice}
            </label>
          ))}
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
