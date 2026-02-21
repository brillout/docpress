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
      {choices.map((choice, i) => (
        // Radio inputs are used to control choice visibility using CSS
        <input key={i} id={`radioFor-${choice}`} type="radio" checked={selectedChoice === choice} hidden readOnly />
      ))}
      <div
        aria-haspopup="listbox"
        aria-expanded={expanded}
        className={cls(['custom-select-wrapper', (hide || isDisabled(selectedChoice)) && 'hidden'])}
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
        <div
          role="listbox"
          aria-activedescendant={`choice-${selectedChoice}`}
          className="sliding-rectangle"
          style={{ top: rectTop, height: choices.length * height }}
        >
          {choices.map((choice, i) => {
            const disabled = isDisabled(choice)
            const selected = i === selectedIndex

            return (
              <div
                className="choice-label"
                key={i}
                id={`choice-${selectedChoice}`}
                role="option"
                aria-selected={selected}
                aria-disabled={disabled}
                style={{
                  height: height,
                  borderBottom: i !== choices.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  background: selected ? '#eee' : 'white',
                  color: disabled ? '#999' : undefined,
                  fontWeight: selected ? 500 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : undefined,
                }}
                onClick={(e) => {
                  const el = e.currentTarget
                  prevPositionRef.current = { top: el.getBoundingClientRect().top, el }

                  if (i === selectedIndex) {
                    e.stopPropagation()
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
      {children}
    </div>
  )
}
