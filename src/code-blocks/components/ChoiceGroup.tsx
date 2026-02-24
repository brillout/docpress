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
    <div data-choice-group={groupName} className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choiceGroup.choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
      <div
        id={`choicesFor-${groupName}`}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        className={cls(['custom-select-wrapper', (hide || isDisabled(selectedChoice)) && 'hidden'])}
        style={{ '--lvl': lvl, height: height }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => {
          if (!expanded) next()
        }}
      >
        <div
          aria-activedescendant={`choice-${selectedChoice}`}
          role="listbox"
          className="sliding-rectangle"
          style={{ top: rectTop, height: choices.length * height }}
        >
          {choices.map((choice, i) => {
            const disabled = isDisabled(choice)
            const selected = i === selectedIndex

            return (
              <div
                key={i}
                aria-selected={selected}
                aria-disabled={disabled}
                role="option"
                className="choice-label"
                style={{
                  height: height,
                  borderBottom: i !== choices.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={(e) => {
                  const el = e.currentTarget
                  prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
                  e.stopPropagation()
                  if (i === selectedIndex) {
                    next()
                  } else if (!disabled) {
                    setSelectedChoice(choice)
                  }
                }}
              >
                {choice}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
