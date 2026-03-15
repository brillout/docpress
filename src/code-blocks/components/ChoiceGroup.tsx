export { ChoiceGroup }

import React, { useEffect, useRef, useState } from 'react'
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
}: { children: React.ReactNode; choiceGroup: TChoiceGroup; lvl: string; hide: boolean }) {
  const level = Number(lvl)
  const { name: groupName, choices, default: defaultChoice, disabled: disabledChoices } = choiceGroup
  // TODO/after-PR-merge rename useSelectedChoice useCurrentSelection
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const choiceGroupRef = useRef<HTMLDivElement>(null)
  const [rightOffset, setRightOffset] = useState(0)

  useEffect(() => {
    if (level === 0 || !choiceGroupRef.current) return
    const parentCustomSelect = choiceGroupRef.current.closest(`[data-lvl="${level - 1}"]`)!.lastElementChild!
    const width = parentCustomSelect.getBoundingClientRect().width

    setRightOffset(level * width + 2)
  }, [])

  const isDisabled = (choice: string) => disabledChoices.includes(choice)
  const selectedIndex = choices.indexOf(selectedChoice)

  const height = 25
  const [expanded, setExpanded] = useState(false)
  const rectTop = -selectedIndex * height

  // Cycle to next option
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
    <div ref={choiceGroupRef} data-choice-group={groupName} data-lvl={level} className="choice-group">
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
        className={cls(['select-container', (hide || isDisabled(selectedChoice)) && 'hidden'])}
        style={{ height, '--right-offset': `${rightOffset}px` }}
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
              className="select-choice"
              style={{ height }}
              onClick={handleOnClick}
            >
              <span>{choice}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  function handleOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation()
    const el = e.currentTarget
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    if (el.ariaSelected === 'true') {
      next()
    } else if (el.ariaDisabled === 'false') {
      setSelectedChoice(el.id)
    }
  }
}
