export { ChoiceGroup, CustomSelectsContainer }

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useSelectedChoice } from '../hooks/useSelectedChoice.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { cls } from '../../utils/cls.js'
import './ChoiceGroup.css'

type TChoiceGroup = {
  name: string
  choices: string[]
  default: string
  disabled: string[]
  hidden: boolean
  lvl: number
}

type ParentGroup = {
  name: string
  default: string
}

type ChoiceGroupWithParent = TChoiceGroup & { parentGroup?: ParentGroup & { choices: string[] } }

type ContextType = {
  choiceGroupAll: ChoiceGroupWithParent[]
  registerChoiceGroup: (choiceGroup: TChoiceGroup, parentGroup?: ParentGroup & { choice: string }) => void
}

const CustomSelectsContainerContext = createContext<ContextType | undefined>(undefined)

function useCustomSelectsContext() {
  const ctx = useContext(CustomSelectsContainerContext)
  if (!ctx) throw new Error('useCustomSelectsContext must be used inside provider')
  return ctx
}

function CustomSelectsContainer({ children }: { children: React.ReactNode }) {
  const [choiceGroupAll, setChoiceGroupAll] = useState<ChoiceGroupWithParent[]>([])

  const registerChoiceGroup = useCallback(
    (choiceGroup: TChoiceGroup, parentGroup?: ParentGroup & { choice: string }) => {
      setChoiceGroupAll((prev) => {
        const { lvl } = choiceGroup
        const existing = prev[lvl]

        if (existing) {
          if (!parentGroup || !existing.parentGroup) return prev

          const mergedChoices = new Set([...existing.parentGroup.choices, parentGroup.choice])

          if (mergedChoices.size === existing.parentGroup.choices.length) return prev

          const next = [...prev]
          next[lvl] = {
            ...existing,
            parentGroup: {
              ...existing.parentGroup,
              choices: [...mergedChoices],
            },
          }
          return next
        }

        const next = [...prev]
        next[lvl] = {
          ...choiceGroup,
          ...(parentGroup && {
            parentGroup: {
              ...parentGroup,
              choices: [parentGroup.choice],
            },
          }),
        }

        return next
      })
    },
    [],
  )

  return (
    <CustomSelectsContainerContext.Provider value={{ choiceGroupAll, registerChoiceGroup }}>
      {children}
    </CustomSelectsContainerContext.Provider>
  )
}

type ChoiceGroupProps = {
  children: React.ReactNode
  choiceGroup: TChoiceGroup
  parentGroup?: ParentGroup & { choice: string }
}

function ChoiceGroup({ children, choiceGroup, parentGroup }: ChoiceGroupProps) {
  const { name: groupName, choices, default: defaultChoice, lvl } = choiceGroup
  // TODO/after-PR-merge rename useSelectedChoice useCurrentSelection
  const [selectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const { choiceGroupAll, registerChoiceGroup } = useCustomSelectsContext()

  useEffect(() => registerChoiceGroup(choiceGroup, parentGroup), [])

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
      {lvl === 0 && (
        <div className={`selects-container`}>
          {choiceGroupAll.map((choiceGroup, i) => (
            <CustomSelect key={i} choiceGroup={choiceGroup} />
          ))}
        </div>
      )}
    </div>
  )
}

function CustomSelect({
  choiceGroup,
}: { choiceGroup: TChoiceGroup & { parentGroup?: ParentGroup & { choices: string[] } } }) {
  const {
    name: groupName,
    choices,
    default: defaultChoice,
    disabled: disabledChoices,
    hidden,
    parentGroup,
  } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  function isHidden() {
    if (parentGroup) {
      const [parentSelectedChoice] = useSelectedChoice(parentGroup.name, parentGroup.default)
      return !parentGroup.choices.includes(parentSelectedChoice) || hidden
    }
    return hidden
  }

  const [expanded, setExpanded] = useState(false)
  const selectedIndex = choices.indexOf(selectedChoice)
  const height = 25
  const rectTop = -selectedIndex * height

  const isDisabled = (choice: string) => disabledChoices.includes(choice)
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
      className={cls(['select-container', (isHidden() || isDisabled(selectedChoice)) && 'hidden'])}
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
    if (el.getAttribute('aria-selected') === 'true') {
      next()
    } else if (el.getAttribute('aria-disabled') === 'false') {
      setSelectedChoice(el.id)
    }
  }
}
