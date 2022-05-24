import React from 'react'
import { P } from './P'

export { Info }

function Info({ children }: { children: React.ReactNode }) {
  return (
    <blockquote>
      <P>{children}</P>
    </blockquote>
  )
}
