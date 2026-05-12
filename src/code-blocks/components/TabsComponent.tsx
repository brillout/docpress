import React from 'react'
import { Tabs, TabList, Tab } from 'react-tabs'
import { useCurrentSelection } from '../hooks/useCurrentSelection.js'
import { useRestoreScroll } from '../hooks/useRestoreScroll.js'
import type { TChoiceGroup } from './ChoiceGroup.js'
import './TabsComponent.css'

export { TabsComponent }

function TabsComponent({
  choiceGroup,
  children,
}: { choiceGroup: Omit<TChoiceGroup, 'lvl'>; children: React.ReactNode }) {
  const { name: groupName, choices, default: defaultChoice, hidden } = choiceGroup
  const [selectedChoice, setSelectedChoice] = useCurrentSelection(groupName, defaultChoice)
  const prevPositionRef = useRestoreScroll([selectedChoice])
  const selectedIndex = choices.indexOf(selectedChoice)

  return (
    <Tabs
      data-choice-group={groupName}
      selectedIndex={selectedIndex}
      onSelect={handleOnSelect}
      forceRenderTabPanel={true}
    >
      {/* Hidden select used to control tablist and tabpanel styling and visibility via CSS. */}
      <select name={`choicesFor-${groupName}`} value={selectedChoice} hidden disabled>
        {choices.map((choice, i) => (
          <option key={i} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <TabList id={`choicesFor-${groupName}`} hidden={hidden}>
        {choices.map((choice, index) => (
          <Tab key={index}>{choice}</Tab>
        ))}
      </TabList>
      {children}
    </Tabs>
  )

  function handleOnSelect(index: number, _last: number, event: Event) {
    const el = event.currentTarget as HTMLDivElement
    prevPositionRef.current = { top: el.getBoundingClientRect().top, el }
    setSelectedChoice(choices[index]!)
  }
}
