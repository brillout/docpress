export { ChoiceGroup, ChoiceGroupContainer }

import type { ChoiceGroup as TChoiceGroup, ChoiceGroupWithParent } from '../types.js'
import React, { useId, useState } from 'react'
import { usePageContext } from '../../renderer/usePageContext.js'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { getAvailableChoice } from '../utils/getAvailableChoice.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

function ChoiceGroupContainer({
  children,
  choiceGroupAll,
}: { children: React.ReactNode; choiceGroupAll: ChoiceGroupWithParent[] }) {
  const renderCustomSelect = (choiceGroupAll ?? []).some((choiceGroup) => choiceGroup.lvl === 0 && !choiceGroup.hidden)
  return (
    <div className="choice-group-container">
      {children}
      {renderCustomSelect && (
        <div className={`choice-group__selects`}>
          {(choiceGroupAll ?? []).map((choiceGroup) => (
            <CustomSelect key={choiceGroup.name} choiceGroup={choiceGroup} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChoiceGroup({ children, choiceGroup }: { children: React.ReactNode; choiceGroup: TChoiceGroup }) {
  const { name: groupName, choices, default: defaultChoice, emptyChoices } = choiceGroup
  const [selectedChoiceStored] = useCurrentSelection(groupName, defaultChoice)
  const selectedChoice = getAvailableChoice(selectedChoiceStored, choices, emptyChoices, defaultChoice)

  return (
    <div className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select data-choice-group={groupName} name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map(({ name: choice }) => (
          // data-empty is read by the initializeChoiceGroup SSR script (useCurrentSelection.ts)
          <option key={choice} value={choice} data-empty={emptyChoices.includes(choice) ? '' : undefined}>
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
  const choicesAll = usePageContext().resolved.choices
  const { name: groupName, emptyChoices, default: defaultChoice, hidden, parentChoiceGroup, isBuiltIn } = choiceGroup
  const choices = (isBuiltIn ? choiceGroup : choicesAll![groupName]!).choices
  const [selectedChoiceStored, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const selectedChoice = getAvailableChoice(selectedChoiceStored, choices, emptyChoices, defaultChoice)
  const [expanded, setExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  let [parentSelectedChoice] = useCurrentSelection(parentChoiceGroup?.name || '', parentChoiceGroup?.default || '')
  let isHidden = hidden
  const setPrevPosition = useRestoreScroll([selectedChoice])

  if (parentChoiceGroup) {
    const { choices, emptyChoices, default: defaultChoice } = parentChoiceGroup
    parentSelectedChoice = getAvailableChoice(parentSelectedChoice, choices, emptyChoices, defaultChoice)
    isHidden = !parentChoiceGroup.choices.includes(parentSelectedChoice)
  }
  const isEmptyChoice = (choice: string) => emptyChoices.includes(choice)
  const filteredChoices = choices.filter((choice) => !isEmptyChoice(choice.name))
  const selectedIndex = filteredChoices.findIndex((choice) => choice.name === selectedChoice)

  return (
    <div
      id={`choicesFor-${groupName}`}
      aria-expanded={expanded}
      role="radiogroup"
      className={cls([
        'choice-select__list',
        (isHidden || isEmptyChoice(selectedChoice)) && 'hidden',
        isHovered && 'hovered',
      ])}
      style={{ '--option-height': `${OPTION_HEIGHT}px`, '--choice-count': filteredChoices.length }}
      onMouseEnter={() => {
        setExpanded(true)
        setIsHovered(true)
      }}
      onMouseLeave={() => setExpanded(false)}
      onTransitionEnd={() => {
        if (!expanded) setIsHovered(false)
      }}
      onClick={() => {
        if (!expanded) next()
      }}
      data-choice-group={groupName}
    >
      <div className="choice-select__border" />
      {filteredChoices.map(({ name: choice, icon, iconStyle }) => (
        <label
          id={`choice-${choice}`}
          key={choice}
          className={`choice-select__option`}
          onClick={(e) => handleOnClick(e, choice)}
        >
          <input
            type="radio"
            className="choice-select__radio sr-only"
            name={`radio-${radioId}`}
            value={choice}
            checked={selectedChoice === choice}
            readOnly
          />
          <span className="choice-select__option-content">
            {icon && <img src={icon} alt="" aria-hidden="true" style={iconStyle} />}
            {choice}
          </span>
        </label>
      ))}
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
