export { Page }

import React from 'react'
import { LoremIpsum } from './LoremIpsum'

function Page() {
  return (
    <>
      <Block noMargin>
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

function Block({ children, noMargin }: { children: React.ReactNode; noMargin?: true }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-gray)',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 20,
        marginTop: noMargin ? 0 : 'var(--block-margin)',
      }}
    >
      <div style={{ maxWidth: 1000 }}>{children}</div>
    </div>
  )
}
