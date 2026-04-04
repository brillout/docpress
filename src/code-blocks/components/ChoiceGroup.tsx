export { ChoiceGroup, CustomSelectsContainer }

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSelectedChoice } from '../hooks/useSelectedChoice.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

type TChoiceGroup = {
  name: string
  choices: string[]
  default: string
  disabled: string[]
  hidden?: Boolean
}

function ChoiceGroup({
  children,
  choiceGroup,
  lvl,
  hide = false,
}: { children: React.ReactNode; choiceGroup: TChoiceGroup; lvl: string; hide: boolean }) {
  const { setChoiceGroups } = useContext(CustomSelectsContainerContext)
  const level = Number(lvl)
  const { name: groupName, choices, default: defaultChoice } = choiceGroup
  // TODO/after-PR-merge rename useSelectedChoice useCurrentSelection
  const [selectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const choiceGroupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!choiceGroupRef.current) return
    setChoiceGroups((prev) => {
      if (prev[level] !== undefined) return prev
      const newItems = [...prev]
      newItems[level] = { ...choiceGroup, hidden: hide }
      return newItems
    })
  }, [])

  return (
    <div ref={choiceGroupRef} data-choice-group={groupName} data-lvl={level} className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
      {level === 0 && <div className="selects-container"></div>}
    </div>
  )
}

const CustomSelectsContainerContext = createContext<{
  choiceGroups: TChoiceGroup[]
  setChoiceGroups: React.Dispatch<React.SetStateAction<TChoiceGroup[]>>
}>({ choiceGroups: [], setChoiceGroups: () => {} })

function CustomSelectsContainer({ children }: { children: React.ReactNode }) {
  const [choiceGroups, setChoiceGroups] = useState<TChoiceGroup[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef}>
      <CustomSelectsContainerContext value={{ choiceGroups, setChoiceGroups }}>
        {containerRef.current &&
          choiceGroups
            .flat()
            .reverse()
            .map((choiceGroup, i) =>
              createPortal(
                <CustomSelect key={i} choiceGroup={choiceGroup} />,
                containerRef.current!.querySelector('.selects-container')!,
              ),
            )}
        {children}
      </CustomSelectsContainerContext>
    </div>
  )
}

function CustomSelect({ choiceGroup }: { choiceGroup: TChoiceGroup }) {
  const { name: groupName, choices, default: defaultChoice, disabled: disabledChoices, hidden } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])

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
    <div
      id={`choicesFor-${groupName}`}
      aria-haspopup="listbox"
      aria-expanded={expanded}
      className={cls(['select-container', (hidden || isDisabled(selectedChoice)) && 'hidden'])}
      style={{ height }}
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
