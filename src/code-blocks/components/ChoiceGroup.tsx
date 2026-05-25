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

type ChoiceGroupWithParent = TChoiceGroup & {
  parentChoiceGroup?: {
    name: string
    default: string
    choices: string[]
  }
}

const CustomSelectsContainerContext = createContext<{ choiceGroupAll: ChoiceGroupWithParent[] } | undefined>(undefined)

function useCustomSelectsContext() {
  const ctx = useContext(CustomSelectsContainerContext)
  if (!ctx) throw new Error('useCustomSelectsContext must be used inside provider')
  return ctx
}

function CustomSelectsContainer({
  children,
  choiceGroupAll,
}: { children: React.ReactNode; choiceGroupAll: ChoiceGroupWithParent[] }) {
  return <CustomSelectsContainerContext value={{ choiceGroupAll }}>{children}</CustomSelectsContainerContext>
}

function ChoiceGroup({ children, choiceGroup }: { children: React.ReactNode; choiceGroup: TChoiceGroup }) {
  const { name: groupName, choices, default: defaultChoice, lvl } = choiceGroup
  const [selectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const { choiceGroupAll } = useCustomSelectsContext()

  return (
    <div data-choice-group={groupName} data-lvl={lvl} className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
      {lvl === 0 && !choiceGroup.hidden && (
        <div className={`choice-group__selects`}>
          {choiceGroupAll.map((choiceGroup) => (
            <CustomSelect key={choiceGroup.name} choiceGroup={choiceGroup} />
          ))}
        </div>
      )}
    </div>
  )
}

const OPTION_HEIGHT = 25
function CustomSelect({ choiceGroup }: { choiceGroup: ChoiceGroupWithParent }) {
  const { name: groupName, choices, emptyChoices, default: defaultChoice, hidden, parentChoiceGroup } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const [expanded, setExpanded] = useState(false)
  const [parentSelectedChoice] = useCurrentSelection(parentChoiceGroup?.name || '', parentChoiceGroup?.default || '')
  const setPrevPosition = useRestoreScroll([selectedChoice])

  const isHidden = parentChoiceGroup ? !parentChoiceGroup.choices.includes(parentSelectedChoice) : hidden
  const isEmptyChoice = (choice: string) => emptyChoices.includes(choice)
  const filteredChoices = choices.filter((choice) => !isEmptyChoice(choice))
  const selectedIndex = filteredChoices.indexOf(selectedChoice)
  const rectTop = -selectedIndex * OPTION_HEIGHT

  return (
    <div
      id={`choicesFor-${groupName}`}
      aria-haspopup="listbox"
      aria-expanded={expanded}
      className={cls(['choice-select', (isHidden || isEmptyChoice(selectedChoice)) && 'hidden'])}
      style={{ height: OPTION_HEIGHT }}
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
        style={{ top: rectTop, height: filteredChoices.length * OPTION_HEIGHT }}
      >
        {filteredChoices.map((choice, i) => (
          <div
            id={`choice-${choice}`}
            key={choice}
            aria-selected={i === selectedIndex}
            role="option"
            className="choice-select__option"
            style={{ height: OPTION_HEIGHT }}
            onClick={(e) => handleOnClick(e, choice)}
          >
            {choice}
          </div>
        ))}
      </div>
    </div>
  )

  function next() {
    const nextIndex = (selectedIndex + 1) % filteredChoices.length
    setSelectedChoice(filteredChoices[nextIndex]!)
  }
  function handleOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>, choice: string) {
    e.stopPropagation()
    const el = e.currentTarget
    setPrevPosition(el)
    if (el.getAttribute('aria-selected') === 'true') {
      next()
    } else {
      setSelectedChoice(choice)
    }
  }
}
