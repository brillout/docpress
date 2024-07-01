export { Warning }
export { Construction }
export { Contribution }
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

function Warning({ children }: { children: React.ReactNode }) {
  return <NoteGeneric type="warning">{children}</NoteGeneric>
}
function Construction({ children }: { children: React.ReactNode }) {
  return <NoteGeneric type="construction">{children}</NoteGeneric>
}
function Contribution({ children }: { children: React.ReactNode }) {
  return <NoteGeneric type="contribution">{children}</NoteGeneric>
}
function Danger({ children }: { children: React.ReactNode }) {
  return <NoteGeneric type="danger">{children}</NoteGeneric>
}
function NoteWithoutIcon({ children }: { children: React.ReactNode }) {
  return <NoteGeneric icon={null}>{children}</NoteGeneric>
}
type CustomIcon = JSX.Element | string
function NoteWithCustomIcon({ icon, children }: { children: React.ReactNode; icon: CustomIcon }) {
  if (!icon) throw new Error(`<NoteWithCustomIcon icon={/*...*/}> property 'icon' is \`${icon}\` which is forbidden`)
  return <NoteGeneric icon={icon}>{children}</NoteGeneric>
}

function NoteGeneric({
  type,
  icon,
  iconMargin,
  children,
}: {
  icon?: null | CustomIcon
  iconMargin?: null | number
  type?: 'danger' | 'warning' | 'construction' | 'contribution'
  children: React.ReactNode
}) {
  assert(icon === null || icon || type, { icon, type })

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
    if (type === 'contribution') {
      icon = '💚'
      classColor = 'note-color-green'
      iconMargin = 2
    }
    assert(icon)
    assert(classColor)
    className = `${className} ${classColor}`
  }
  return (
    <blockquote className={className}>
      <div style={{ marginBottom: 20 }} />
      {icon}<span style={{width: iconMargin ?? undefined, display: 'inline-block'}}></span> <div className="blockquote-content">{children}</div>
      <div style={{ marginTop: 20 }} />
    </blockquote>
  )
}
