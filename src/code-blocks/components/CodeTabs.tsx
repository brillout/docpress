export { CodeTabs, CodeTabPanel }

import React from 'react'
import { useSelectedTab } from '../hooks/useSelectedTab'
import './CodeTabs.css'

type CodeTabsProps = {
  defaultTab?: string
  items: string[]
  persistId?: string
  children: React.ReactNode
}

function CodeTabs({ children, items, defaultTab, persistId }: CodeTabsProps) {
  const tabs = items.map((item) => item.toLowerCase())
  const [activeTab, setActiveTab] = useSelectedTab(persistId, defaultTab || tabs[0])

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((tab: string) => tab === activeTab)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length
        break
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    const nextTab = tabs[nextIndex]
    setActiveTab(nextTab)

    const tab = document.getElementById(`tab-${nextTab}`)
    if (tab) tab.focus()
  }

  return (
    <div className="tabs" data-key={persistId}>
      {tabs.map((tab, index) => (
        // Radio inputs used to control tab and tab panel styling without causing React hydration warnings
        <input key={index} type="radio" name={tab} checked={activeTab === tab} hidden readOnly />
      ))}
      <div role="tablist" onKeyDown={handleOnKeyDown}>
        {tabs.map((tab, index) => (
          <CodeTab key={index} activeTab={activeTab} setActiveTab={setActiveTab} value={tab} />
        ))}
      </div>
      {children}
    </div>
  )
}

const CodeTab = ({
  value,
  activeTab,
  setActiveTab,
}: { value: string; activeTab: string; setActiveTab: (value: string) => void }) => {
  const isActive = activeTab === value
  const tabId = `tab-${value}`
  const panelId = `panel-${value}`

  return (
    <button
      id={tabId}
      name={value}
      role="tab"
      className="raised"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={!isActive ? -1 : undefined}
      onClick={() => setActiveTab(value)}
    >
      {value.toUpperCase()}
    </button>
  )
}

const CodeTabPanel = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const tabId = `tab-${value}`
  const panelId = `panel-${value}`

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId}>
      {children}
    </div>
  )
}
