export { Page }

import React from 'react'
import { LoremIpsum } from './LoremIpsum'

function Page() {
  return (
    <>
      <Block>
        <Header />
        <p>This demo is used for testing and developing DocPress.</p>
        <LoremIpsum />
        <LoremIpsum />
        <div style={{ height: 30 }} />
      </Block>
    </>
  )
}

function Header() {
  return (
    <>
      <h1 style={{ textAlign: 'center', fontSize: '3.4em' }}>Next Generation Docs</h1>
    </>
  )
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 20,
      }}
    >
      <div style={{ maxWidth: 1000 }}>{children}</div>
    </div>
  )
}
