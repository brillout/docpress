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
  hidden?: boolean
}

type PortalTarget = { level: number; el: HTMLDivElement }

type ContextType = {
  choiceGroups: (TChoiceGroup | undefined)[]
  addChoiceGroup: (level: number, choiceGroup: TChoiceGroup) => void
  targets: PortalTarget[]
  addTarget: (target: PortalTarget) => void
  removeTarget: (target: PortalTarget) => void
}

const CustomSelectsContainerContext = createContext<ContextType | undefined>(undefined)

function useCustomSelectsContext() {
  const ctx = useContext(CustomSelectsContainerContext)
  if (!ctx) throw new Error('useCustomSelectsContext must be used inside provider')
  return ctx
}

function CustomSelectsContainer({ children }: { children: React.ReactNode }) {
  const [choiceGroups, setChoiceGroups] = useState<TChoiceGroup[]>([])
  const [targets, setTargets] = useState<PortalTarget[]>([])

  function addChoiceGroup(level: number, choiceGroup: TChoiceGroup) {
    setChoiceGroups((prev) => {
      if (prev[level]?.name === choiceGroup.name) return prev
      const newItems = [...prev]
      newItems[level] = choiceGroup
      return newItems
    })
  }
  function addTarget(target: PortalTarget) {
    setTargets((prev) => {
      if (prev.find((t) => t.el === target.el)) return prev
      return [...prev, target]
    })
  }
  function removeTarget(target: PortalTarget) {
    setTargets((prev) => prev.filter((t) => t.el !== target.el))
  }

  return (
    <CustomSelectsContainerContext value={{ choiceGroups, targets, addChoiceGroup, addTarget, removeTarget }}>
      {children}
      {targets.map((target) =>
        choiceGroups
          .slice(0, target.level + 1)
          .reverse()
          .map((choiceGroup, i) =>
            createPortal(<CustomSelect key={`${target.level}-${i}`} choiceGroup={choiceGroup} />, target.el),
          ),
      )}
    </CustomSelectsContainerContext>
  )
}

type ChoiceGroupProps = {
  children: React.ReactNode
  choiceGroup: TChoiceGroup
  lvl: string
  hide: boolean
}

function ChoiceGroup({ children, choiceGroup, lvl, hide = false }: ChoiceGroupProps) {
  const level = Number(lvl)
  const { addChoiceGroup, addTarget, removeTarget } = useCustomSelectsContext()
  const { name: groupName, choices, default: defaultChoice } = choiceGroup
  // TODO/after-PR-merge rename useSelectedChoice useCurrentSelection
  const [selectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    addChoiceGroup(level, { ...choiceGroup, hidden: hide })
    if (!targetRef.current) return
    const target: PortalTarget = { level, el: targetRef.current }
    addTarget(target)
    return () => removeTarget(target)
  }, [])

  return (
    <div data-choice-group={groupName} data-lvl={level} className="choice-group">
      {/* Hidden select used to control choice visibility via CSS */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      {children}
      <div ref={targetRef} className={`selects-container`} />
    </div>
  )
}

function CustomSelect({ choiceGroup }: { choiceGroup: TChoiceGroup }) {
  const { name: groupName, choices, default: defaultChoice, disabled: disabledChoices, hidden } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])

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
    if (el.getAttribute('aria-selected') === 'true') {
      next()
    } else if (el.getAttribute('aria-disabled') === 'false') {
      setSelectedChoice(el.id)
    }
  }
}
