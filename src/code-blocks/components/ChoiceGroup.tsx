export { ChoiceGroup }

import React, { useState } from 'react'
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
}: { children: React.ReactNode; choiceGroup: TChoiceGroup; lvl: number; hide: boolean }) {
  const { name: groupName, choices, default: defaultChoice, disabled: disabledChoices } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useSelectedChoice(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])

  const height = 25
  const width = 120
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const next = () => setSelectedIndex((s) => (s + 1) % choices.length)

  const rectTop = -selectedIndex * height

  return (
    <div data-choice-group={choiceGroup.name} className="choice-group">
      <div
        role="radiogroup"
        className="raised"
        // aria-label="Select an option"
        style={{
          display: hide ? 'none' : undefined,
          width,
          height: height,
          position: 'absolute',
          top: 10,
          right: 42 + 2,
          zIndex: 3,
          overflow: expanded ? 'visible' : 'hidden',
          boxSizing: 'border-box',
          // borderRadius: 5,
          // borderWidth: "1px 2px 2px 1px",
          // borderStyle: "solid", // rgba(0,0,0,0.12)
          // borderColor: "hsl(0, 0%, 75%) hsl(0, 0%, 72%) hsl(0, 0%, 72%) hsl(0, 0%, 75%)",

          // background: "transparent",
          userSelect: 'none',
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => {
          if (!expanded) next()
        }}
      >
        <div
          style={{
            position: 'absolute',
            // left: 0,
            top: rectTop,
            width: '100%',
            height: choices.length * height,
            boxSizing: 'border-box',
            background: '#fff',
            borderRadius: 5,
            // border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            zIndex: 20,
            transition: 'top 180ms cubic-bezier(.2,.9,.2,1)',
            overflow: 'hidden',
          }}
        >
          {choices.map((choice, i) => (
            <label
              key={i}
              style={{
                display: 'block',
                height: height,
                lineHeight: '20px',
                paddingLeft: '12px',
                paddingRight: '12px',
                boxSizing: 'border-box',
                borderBottom: i !== choices.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                background: i === selectedIndex ? '#eee' : 'white',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={(e) => {
                if (i === selectedIndex) {
                  e.preventDefault()
                  next()
                }
              }}
            >
              <input
                type="radio"
                name="vertical-select"
                value={choice}
                checked={i === selectedIndex}
                onChange={() => setSelectedIndex(i)}
                disabled={disabledChoices.includes(choice)}
                style={{ display: 'none' }}
              />
              {choice}
            </label>
          ))}
        </div>
      </div>
      {/* <select
        name={`choicesFor-${choiceGroup.name}`}
        value={selectedChoice}
        onChange={onChange}
        className={cls(['select-choice', hide && 'hidden'])}
        style={{ '--lvl': lvl }}
      >
        {choiceGroup.choices.map((choice, i) => (
          <option key={i} value={choice} disabled={choiceGroup.disabled.includes(choice)}>
            {choice}
          </option>
        ))}
      </select> */}
      {children}
    </div>
  )

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const el = e.target
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(el.value)
  }
}
