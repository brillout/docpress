export { Warning }
export { Construction }
export { Danger }
export { NoteWithoutIcon }
export { NoteWithCustomIcon }
/* Use markdown instead:
 * ```diff
 * - <Note>Some note</Note>
 * + > Some note
 * ```
export { Note }
*/

import React from 'react'
import { assert } from '../utils/assert'
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
function NoteWithoutIcon({ children }: { children: JSX.Element }) {
  return <Note icon={null}>{children}</Note>
}
type CustomIcon = JSX.Element | string
function NoteWithCustomIcon({ icon, children }: { children: JSX.Element; icon: CustomIcon }) {
  return <Note icon={icon}>{children}</Note>
}

function Note({
  type,
  icon,
  children
}: {
  icon?: null | CustomIcon
  type?: 'danger' | 'warning' | 'construction'
  children: JSX.Element
}) {
  assert(icon === null || icon || type)

  let className = 'custom-icon'
  if (type) {
    className = `${className} type-${type}`
  }
  if (!icon && type) {
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
    assert(icon)
    assert(classColor)
    className = `${className} ${classColor}`
  }
  return (
    <blockquote className={className}>
      <div style={{ marginBottom: 20 }} />
      {icon} <div className="blockquote-content">{children}</div>
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
