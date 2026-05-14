export { Tabs }

import React from 'react'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import { assertUsage } from '../../utils/assert.js'
import './Tabs.css'

function Tabs({ choice }: { choice: string }) {
  const groupName = choice
  const pageContext = usePageContext()
  const choicesAll = pageContext.config.docpress.choices
  assertUsage(choicesAll && choicesAll[groupName], `${groupName} is unknown`)

  const { choices, default: defaultChoice } = choicesAll[groupName]
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const selectedIndex = choices.indexOf(selectedChoice)

  return (
    <div className="react-tabs" data-choice-group={groupName}>
      {/* Hidden select used to control tablist styling via CSS. */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <ul id={`choicesFor-${groupName}`} className="react-tabs__tab-list" role="tablist">
        {choices.map((choice, i) => (
          <li
            key={i}
            id={choice}
            className="react-tabs__tab"
            role="tab"
            aria-selected={i === selectedIndex}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={(e) => handleOnClick(e, i)}
            onKeyDown={handleOnKeyDown}
          >
            {choice}
          </li>
        ))}
      </ul>
    </div>
  )

  function handleOnClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) {
    const el = e.currentTarget
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(choices[index]!)
  }

  function handleOnKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
    const el = e.currentTarget
    let nextIndex = selectedIndex

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (selectedIndex + 1) % choices.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (selectedIndex - 1 + choices.length) % choices.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = choices.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    const nextChoice = choices[nextIndex]!
    setSelectedChoice(nextChoice)
    const tabEl = el.parentElement?.parentElement as HTMLDivElement

    if (!isInViewport(tabEl)) tabEl.scrollIntoView({ block: 'start', behavior: 'smooth' })
    el.focus()
  }
}

function isInViewport(el: Element) {
  const rect = el.getBoundingClientRect()
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
}
