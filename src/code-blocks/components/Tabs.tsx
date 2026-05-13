export { Tabs }

import React from 'react'
import { Tabs as ReactTabs, TabList, Tab, TabPanel } from 'react-tabs'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import { usePageContext } from '../../renderer/usePageContext.js'
import { assertUsage } from '../../utils/assert.js'
import './Tabs.css'

function Tabs({ choice, children }: { choice: string; children: React.ReactNode }) {
  const groupName = choice
  const pageContext = usePageContext()
  const choicesAll = pageContext.config.docpress.choices
  assertUsage(
    choicesAll && choicesAll[groupName],
    `Missing "choices" for [${groupName}]. Define it in +docpress.choices.`,
  )

  const { choices, default: defaultChoice } = choicesAll[groupName]
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const selectedIndex = choices.indexOf(selectedChoice)

  return (
    <ReactTabs data-choice-group={groupName} selectedIndex={selectedIndex} onSelect={handleOnSelect}>
      {/* Hidden select used to control tablist and tabpanel styling and visibility via CSS. */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <TabList id={`choicesFor-${groupName}`}>
        {choices.map((choice, index) => (
          <Tab key={index}>{choice}</Tab>
        ))}
      </TabList>
      {children}
      {/* Render empty TabPanels to suppress the warning: "There should be an equal number of 'Tab' and 'TabPanel' in `Tabs`." */}
      {choices.map((_, index) => (
        <TabPanel key={index} />
      ))}
    </ReactTabs>
  )

  function handleOnSelect(index: number, _last: number, event: Event) {
    const el = event.currentTarget as HTMLDivElement
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(choices[index]!)
  }
}
