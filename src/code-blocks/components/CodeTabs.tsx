export { CodeTabs, CodeTabPanel }

import React, { useEffect, useRef } from 'react'
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
  const tabListRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRef<null | { top: number; el: Element }>(null)

  // Restores the scroll position of the tab element after toggling between tabs.
  useEffect(() => {
    if (!prevPositionRef.current) return
    const { top, el } = prevPositionRef.current
    const delta = el.getBoundingClientRect().top - top
    console.log(delta)
    if (delta !== 0) {
      window.scrollBy(0, delta)
    }
    prevPositionRef.current = null
  }, [activeTab])

  return (
    <div className="tabs" data-key={persistId}>
      {tabs.map((tab, index) => (
        // Radio inputs used to control tab and tab panel styling without causing React hydration warnings
        <input key={index} id={`radio-${tab}`} type="radio" checked={activeTab === tab} hidden readOnly />
      ))}
      <div ref={tabListRef} role="tablist" onKeyDown={handleOnKeyDown}>
        {tabs.map((tab, index) => (
          <CodeTab
            key={index}
            prevPositionRef={prevPositionRef}
            value={tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
      {children}
    </div>
  )
  function handleOnKeyDown(e: React.KeyboardEvent) {
    if (!tabListRef.current) return
    const tabs = Array.from(tabListRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]'))

    const currentIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
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
    prevPositionRef.current = { top: tabListRef.current.getBoundingClientRect().top, el: tabListRef.current }
    setActiveTab(nextTab.name)
    nextTab.focus()
  }
}

type CodeTabProps = {
  prevPositionRef: React.MutableRefObject<{
    top: number
    el: Element
  } | null>
  value: string
  activeTab: string
  setActiveTab: (value: string) => void
}

function CodeTab({ prevPositionRef, value, activeTab, setActiveTab }: CodeTabProps) {
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
      onClick={onClick}
    >
      {value.toUpperCase()}
    </button>
  )
  function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const element = (e.target as HTMLButtonElement).parentElement as HTMLDivElement
    prevPositionRef.current = { top: element.getBoundingClientRect().top, el: element }
    setActiveTab(value)
  }
}

function CodeTabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  const tabId = `tab-${value}`
  const panelId = `panel-${value}`

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0}>
      {children}
    </div>
  )
}
