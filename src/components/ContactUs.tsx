import React from 'react'
import { TextContactUs } from './TextContactUs'

export { ContactUs }

function ContactUs({ text }: { text: string }) {
  const style: React.CSSProperties = {
    fontSize: '1.5em',
    textAlign: 'center',
    margin: 'auto',
    padding: 'var(--header-padding)',
    maxWidth: 'var(--header-max-width)'
  }
  return (
    <p style={style}>
      {text} <TextContactUs />
    </p>
  )
}
