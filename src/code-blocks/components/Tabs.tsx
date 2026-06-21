export { Tabs }

import React, { useId } from 'react'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import { assertUsage } from '../../utils/assert.js'
import './Tabs.css'

function Tabs({ choice, hide = [] }: { choice: string; hide: string[] }) {
  const radioId = useId()
  const groupName = choice
  const pageContext = usePageContext()
  const choicesAll = pageContext.config.docpress.choices
  assertUsage(choicesAll && choicesAll[groupName], `${groupName} is unknown`)
  const { choices, default: defaultChoice } = choicesAll[groupName]
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const setPrevPosition = useRestoreScroll([selectedChoice])
  const isHidden = (choice: string) => hide.includes(choice)

  return (
    <div className="choice-tabs">
      <div
        id={`choicesFor-${groupName}`}
        className="choice-tabs__tab-list"
        role="radiogroup"
        data-choice-group={groupName}
      >
        {choices.map(({ name: choice, icon, iconStyle }) => (
          <label key={choice} className="choice-tabs__tab" style={{ display: isHidden(choice) ? 'none' : undefined }}>
            <input
              className="choice-tabs__radio sr-only"
              type="radio"
              name={`radio-${radioId}`}
              value={choice}
              checked={selectedChoice === choice}
              onChange={(e) => {
                setPrevPosition(e.currentTarget)
                setSelectedChoice(choice)
              }}
            />
            <span className="choice-tabs__tab-content">
              <img src={icon} alt="" aria-hidden="true" style={iconStyle} />
              {choice}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
