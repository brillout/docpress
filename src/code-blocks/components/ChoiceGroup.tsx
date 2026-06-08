export { ChoiceGroup, CustomSelectsContainer }

import type { ChoiceGroup as TChoiceGroup, ChoiceGroupWithParent } from '../types.js'
import React, { createContext, useContext, useId, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext.js'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

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
        {choices.map(({ name: choice }) => (
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
  const id = useId()
  const choicesAll = usePageContext().config.docpress.choices
  const { name: groupName, emptyChoices, default: defaultChoice, hidden, parentChoiceGroup, isBuiltIn } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const [expanded, setExpanded] = useState(false)
  const [parentSelectedChoice] = useCurrentSelection(parentChoiceGroup?.name || '', parentChoiceGroup?.default || '')
  const setPrevPosition = useRestoreScroll([selectedChoice])

  const { choices } = isBuiltIn ? choiceGroup : choicesAll![groupName]!
  const isHidden = parentChoiceGroup ? !parentChoiceGroup.choices.includes(parentSelectedChoice) : hidden
  const isEmptyChoice = (choice: string) => emptyChoices.includes(choice)
  const filteredChoices = choices.filter((choice) => !isEmptyChoice(choice.name))
  const selectedIndex = filteredChoices.findIndex((choice) => choice.name === selectedChoice)
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
        role="radiogroup"
        className="choice-select__list"
        style={{ top: rectTop, height: filteredChoices.length * OPTION_HEIGHT }}
      >
        {filteredChoices.map(({ name: choice, icon, iconStyle }) => (
          <label
            id={`choice-${choice}`}
            key={choice}
            className="choice-select__option"
            style={{ height: OPTION_HEIGHT }}
            onClick={(e) => handleOnClick(e, choice)}
          >
            <input
              type="radio"
              className="choice-select__radio"
              name={`radio-${id}`}
              value={choice}
              checked={selectedChoice === choice}
              readOnly
            />
            <span className="choice-select__option-content">
              <img src={icon} alt="" aria-hidden="true" style={iconStyle} />
              {choice}
            </span>
          </label>
        ))}
      </div>
    </div>
  )

  function next() {
    const nextIndex = (selectedIndex + 1) % filteredChoices.length
    setSelectedChoice(filteredChoices[nextIndex]!.name)
  }
  function handleOnClick(e: React.MouseEvent<HTMLLabelElement, MouseEvent>, choice: string) {
    e.preventDefault()
    const el = e.currentTarget
    setPrevPosition(el)
    const isSame = selectedChoice === choice
    if (isSame) {
      next()
    } else {
      setSelectedChoice(choice)
    }
  }
}
