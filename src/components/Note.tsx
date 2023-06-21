export { Warning }
export { Construction }
export { Danger }
/* Use markdown instead:
 * ```diff
 * - <Note>Some note</Note>
 * + > Some note
 * ```
export { Note }
*/

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
function Danger({ children }: { children: JSX.Element }) {
  return <Note type="danger">{children}</Note>
}

function Note({
  type,
  icon,
  children
}: {
  icon?: JSX.Element | string
  type?: 'danger' | 'warning' | 'construction'
  children: JSX.Element
}) {
  let className = 'custom-icon'
  if (type) {
    className = `${className} type-${type}`
  }
  if (!icon) {
    let classColor = ''
    if (type === 'danger') {
      icon = ':no_entry:'
      classColor = 'note-color-red'
    }
    if (type === 'warning') {
      icon = ':warning:'
      classColor = 'note-color-yellow'
    }
    if (type === 'construction') {
      icon = ':construction:'
      classColor = 'note-color-yellow'
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
