export { Note }
export { Warning }
export { Construction }

import React from 'react'
/* Imorted in /src/css/index.css instead
import './Note.css'
*/

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
  let className = 'custom-icon'
  if (type) {
    className = `${className} type-${type}`
  }
  if (!icon) {
    let classColor = ''
    if (type === 'error') {
      icon = ':no_entry:'
      classColor = 'color-error'
    }
    if (type === 'warning') {
      icon = ':warning:'
      classColor = 'color-warning'
    }
    if (type === 'construction') {
      icon = ':construction:'
      classColor = 'color-warning'
    }
    if (classColor) {
      className = `${className} ${classColor}`
    }
  }
  return (
    <blockquote className={className}>
      <div style={{ marginBottom: 20 }} />
      {icon} <div className="blockquote-content">{children}</div>
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
