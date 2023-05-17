export { Note }
export { Warning }
export { Construction }

import React from 'react'

function Warning({ children }: { children: JSX.Element }) {
  return <Note type="warning">{children}</Note>
}
function Construction({ children }: { children: JSX.Element }) {
  return <Note type="construction">{children}</Note>
}

function Note({
  type,
  icon,
  children
}: {
  icon?: JSX.Element | string
  type?: 'error' | 'warning' | 'construction'
  children: JSX.Element
}) {
  let className: string | undefined
  if (!icon) {
    if (type === 'error') {
      icon = ':no_entry:'
      className = 'error'
    }
    if (type === 'warning') {
      icon = ':warning:'
      className = 'warning'
    }
    if (type === 'construction') {
      icon = ':construction:'
      className = 'warning'
    }
  }
  return (
    <blockquote className={className}>
      <div style={{ marginBottom: 20 }} />
      {icon} {children}
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
