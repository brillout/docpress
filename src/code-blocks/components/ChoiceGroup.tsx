export { ChoiceGroup, ChoiceGroupContainer }

import type { ChoiceGroup as TChoiceGroup, ChoiceGroupWithParent } from '../types.js'
import React, { useId, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext.js'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

function ChoiceGroupContainer({
  children,
  choiceGroupAll,
}: { children: React.ReactNode; choiceGroupAll: ChoiceGroupWithParent[] }) {
  const renderCustomSelect = choiceGroupAll.some((choiceGroup) => choiceGroup.lvl === 0 && !choiceGroup.hidden)
  return (
    <div className="choice-group-container">
      {children}
      {renderCustomSelect && (
        <div className={`choice-group__selects`}>
          {choiceGroupAll.map((choiceGroup) => (
            <CustomSelect key={choiceGroup.name} choiceGroup={choiceGroup} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChoiceGroup({ children, choiceGroup }: { children: React.ReactNode; choiceGroup: TChoiceGroup }) {
  const { name: groupName, choices, default: defaultChoice } = choiceGroup
  const [selectedChoice] = useCurrentSelection(groupName, defaultChoice)

  return (
    <div className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select data-choice-group={groupName} name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map(({ name: choice }) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
    </div>
  )
}

const OPTION_HEIGHT = 25
function CustomSelect({ choiceGroup }: { choiceGroup: ChoiceGroupWithParent }) {
  const radioId = useId()
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
        data-choice-group={groupName}
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
              name={`radio-${radioId}`}
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
