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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const rectTop = -selectedIndex * height
  const iconTop = (hoveredIndex ?? selectedIndex) * height

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
          {choices.map((choice, i) => (
            <div
              id={choice}
              key={i}
              aria-selected={i === selectedIndex}
              aria-disabled={isDisabled(choice)}
              role="option"
              className="choice-label"
              style={{ height: height }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={handleOnClick}
            >
              <span>{choice}</span>
            </div>
          ))}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 7 6"
            className={cls([
              'choice-icon',
              hoveredIndex === null ? undefined : hoveredIndex === selectedIndex ? 'hover-selected' : 'hover-other',
            ])}
            style={{ top: iconTop }}
          >
            <g className="chevron-upper">
              <path d="M 0 0 L 3 3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </g>
            <g className="chevron-lower">
              <path d="M 3 3 L 0 6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </g>
            <g className="chevron-upper">
              <path d="M 4 0 L 7 3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </g>
            <g className="chevron-lower">
              <path d="M 7 3 L 4 6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )

  function handleOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation()
    const el = e.currentTarget
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setHoveredIndex(null)
    if (el.ariaSelected === 'true') {
      next()
    } else if (el.ariaDisabled === 'false') {
      setSelectedChoice(el.id)
    }
  }
}
