export { Tabs }

import React from 'react'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import { assertUsage } from '../../utils/assert.js'
import './Tabs.css'

function Tabs({ choice, hide = [] }: { choice: string; hide: string[] }) {
  const groupName = choice
  const pageContext = usePageContext()
  const choicesAll = pageContext.config.docpress.choices
  assertUsage(choicesAll && choicesAll[groupName], `${groupName} is unknown`)

  const { choices, default: defaultChoice } = choicesAll[groupName]
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const setPrevPosition = useRestoreScroll([selectedChoice])
  const isHidden = (choice: string) => hide.includes(choice)
  const filteredChoices = choices.filter((choice) => !isHidden(choice.name))
  const selectedIndex = filteredChoices.findIndex((choice) => choice.name === selectedChoice)

  return (
    <div className="choice-tabs" data-choice-group={groupName}>
      {/* Hidden select used to control tablist styling via CSS. */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map(({ name: choice }) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <ul id={`choicesFor-${groupName}`} className="choice-tabs__tab-list" role="tablist">
        {choices.map(({ name: choice }, i) => (
          <li
            key={choice}
            id={`tab-${choice}`}
            style={{ display: isHidden(choice) ? 'none' : undefined }}
            className="choice-tabs__tab"
            role="tab"
            aria-selected={i === selectedIndex}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={(e) => handleOnClick(e, choice)}
            onKeyDown={handleOnKeyDown}
          >
            {choice}
          </li>
        ))}
      </ul>
    </div>
  )

  function handleOnClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>, choice: string) {
    setPrevPosition(e.currentTarget)
    setSelectedChoice(choice)
  }

  function handleOnKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
    const el = e.currentTarget
    let nextIndex = selectedIndex

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (selectedIndex + 1) % filteredChoices.length
        break
      case 'ArrowLeft':
        nextIndex = (selectedIndex - 1 + filteredChoices.length) % filteredChoices.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = filteredChoices.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    setPrevPosition(el)
    const nextChoice = filteredChoices[nextIndex]!
    setSelectedChoice(nextChoice.name)
    const tabEl = el.parentElement?.parentElement as HTMLDivElement

    if (!isInViewport(tabEl)) tabEl.scrollIntoView({ block: 'start', behavior: 'smooth' })
    el.focus()
  }
}

function isInViewport(el: Element) {
  const rect = el.getBoundingClientRect()
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
}
