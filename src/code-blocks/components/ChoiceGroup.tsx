export { ChoiceGroup, CustomSelectsContainer }

import React, { createContext, useContext, useEffect, useState } from 'react'
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
  registerChoiceGroup: (choiceGroup: TChoiceGroup, parentChoiceGroup?: ParentChoiceGroup & { choice: string }) => void
}

const CustomSelectsContainerContext = createContext<ContextType | undefined>(undefined)

function useCustomSelectsContext() {
  const ctx = useContext(CustomSelectsContainerContext)
  if (!ctx) throw new Error('useCustomSelectsContext must be used inside provider')
  return ctx
}

function CustomSelectsContainer({ children }: { children: React.ReactNode }) {
  const [choiceGroupAll, setChoiceGroupAll] = useState<ChoiceGroupWithParent[]>([])

  function registerChoiceGroup(choiceGroup: TChoiceGroup, parentChoiceGroup?: ParentChoiceGroup & { choice: string }) {
    setChoiceGroupAll((prev) => {
      const index = prev.findIndex((g) => g.name === choiceGroup.name)
      const existing = prev[index]

      if (!existing) {
        return [
          ...prev,
          {
            ...choiceGroup,
            ...(parentChoiceGroup && {
              parentChoiceGroup: {
                ...parentChoiceGroup,
                choices: !choiceGroup.hidden ? [parentChoiceGroup.choice] : [],
              },
            }),
          },
        ]
      }

      if (!parentChoiceGroup || !existing.parentChoiceGroup) return prev

      const existingChoices = existing.parentChoiceGroup.choices
      if (!choiceGroup.hidden) existing.parentChoiceGroup.choices.push(parentChoiceGroup.choice)

      const mergedChoices = new Set([...existing.parentChoiceGroup.choices])
      if (mergedChoices.size === existingChoices.length) return prev

      const next = [...prev]
      next[index] = {
        ...existing,
        parentChoiceGroup: {
          ...existing.parentChoiceGroup,
          choices: [...mergedChoices],
        },
      }
      return next
    })
  }

  return (
    <CustomSelectsContainerContext.Provider value={{ choiceGroupAll, registerChoiceGroup }}>
      {children}
    </CustomSelectsContainerContext.Provider>
  )
}

type ChoiceGroupProps = {
  children: React.ReactNode
  choiceGroup: TChoiceGroup
  parentChoiceGroup?: ParentChoiceGroup & { choice: string }
}

function ChoiceGroup({ children, choiceGroup, parentChoiceGroup }: ChoiceGroupProps) {
  const { name: groupName, choices, default: defaultChoice, lvl } = choiceGroup
  const [selectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const { choiceGroupAll, registerChoiceGroup } = useCustomSelectsContext()

  useEffect(() => registerChoiceGroup(choiceGroup, parentChoiceGroup), [])

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
