export { ChoiceGroup, CustomSelectsContainer }

import React, { createContext, useContext, useState } from 'react'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

type TChoiceGroup = {
  name: string
  choices: string[]
  emptyChoices: string[]
  default: string
  hidden: boolean
  lvl: number
}

type ParentChoiceGroup = {
  name: string
  default: string
}

type ChoiceGroupWithParent = TChoiceGroup & { parentChoiceGroup?: ParentChoiceGroup & { choices: string[] } }

type ContextType = {
  choiceGroupAll: ChoiceGroupWithParent[]
}

const CustomSelectsContainerContext = createContext<ContextType | undefined>(undefined)

function useCustomSelectsContext() {
  const ctx = useContext(CustomSelectsContainerContext)
  if (!ctx) throw new Error('useCustomSelectsContext must be used inside provider')
  return ctx
}

function CustomSelectsContainer({ children, choiceGroupAll }: { children: React.ReactNode; choiceGroupAll: ChoiceGroupWithParent[] }) {

  return (
    <CustomSelectsContainerContext value={{ choiceGroupAll }}>
      {children}
    </CustomSelectsContainerContext>
  )
}

type ChoiceGroupProps = {
  children: React.ReactNode
  choiceGroup: TChoiceGroup
}

function ChoiceGroup({ children, choiceGroup }: ChoiceGroupProps) {
  const { name: groupName, choices, default: defaultChoice, lvl } = choiceGroup
  const [selectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const { choiceGroupAll } = useCustomSelectsContext()

  return (
    <div data-choice-group={groupName} data-lvl={lvl} className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
      {lvl === 0 && !choiceGroup.hidden && (
        <div className={`choice-group__selects`}>
          {choiceGroupAll
            .slice()
            .sort((a, b) => a.lvl - b.lvl)
            .map((choiceGroup, i) => (
              <CustomSelect key={i} choiceGroup={choiceGroup} />
            ))}
        </div>
      )}
    </div>
  )
}

function CustomSelect({ choiceGroup }: { choiceGroup: ChoiceGroupWithParent }) {
  const { name: groupName, choices, emptyChoices, default: defaultChoice, hidden, parentChoiceGroup } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const setPrevPosition = useRestoreScroll([selectedChoice])
  const [expanded, setExpanded] = useState(false)

  const isEmptyChoice = (choice: string) => emptyChoices.includes(choice)
  const filteredChoices = choices.filter((choice) => !isEmptyChoice(choice))
  const selectedIndex = filteredChoices.indexOf(selectedChoice)
  const height = 25
  const rectTop = -selectedIndex * height

  function next() {
    const nextIndex = (selectedIndex + 1) % filteredChoices.length
    setSelectedChoice(filteredChoices[nextIndex]!)
  }
  function isHidden() {
    if (parentChoiceGroup) {
      const [parentSelectedChoice] = useCurrentSelection(parentChoiceGroup.name, parentChoiceGroup.default)
      return !parentChoiceGroup.choices.includes(parentSelectedChoice)
    }
    return hidden
  }

  return (
    <div
      id={`choicesFor-${groupName}`}
      aria-haspopup="listbox"
      aria-expanded={expanded}
      className={cls(['choice-select', (isHidden() || isEmptyChoice(selectedChoice)) && 'hidden'])}
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
        className="choice-select__list"
        style={{ top: rectTop, height: filteredChoices.length * height }}
      >
        {filteredChoices.map((choice, i) => (
          <div
            id={choice}
            key={i}
            aria-selected={i === selectedIndex}
            role="option"
            className="choice-select__option"
            style={{ height }}
            onClick={handleOnClick}
          >
            {choice}
          </div>
        ))}
      </div>
    </div>
  )
  function handleOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation()
    const el = e.currentTarget
    setPrevPosition(el)
    if (el.getAttribute('aria-selected') === 'true') {
      next()
    } else {
      setSelectedChoice(el.id)
    }
  }
}
