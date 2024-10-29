export { Page }

import React from 'react'
import { Contributors, Emoji, Sponsors, Consulting } from '@brillout/docpress'
import CodeBlock from './CodeBlock.mdx'

function Page() {
  return (
    <>
      <Block noMargin>
        <Header />
        <Features />
      </Block>
      <Block>
        <Sponsors />
      </Block>
      <Block>
        <Contributors />
      </Block>
      <Block>
        <Consulting />
        <div style={{ height: 30 }} />
      </Block>
    </>
  )
}

function Header() {
  return (
    <>
      <h1 style={{ textAlign: 'center', fontSize: '3.4em' }}>
        Next Generation
        <br />
        Frontend Framework
      </h1>
    </>
  )
}

function Features() {
  return (
    <div>
      <p>
        Praesent <em>eu augue lacinia</em>, tincidunt purus nec, ultrices ante. Donec dolor felis, ornare vel augue
        condimentum.
      </p>
      <p>
        Mauris <code>foo</code> quis scelerisque erat.
      </p>
      <p>
        <i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i>
      </p>
      <p>
        <b>Curabitur</b> gravida urna id ligula volutpat dapibus. Integer accumsan dignissim efficitur. Sed mauris
        tortor, lobortis at suscipit ac, ultricies eu nunc.
      </p>
      <p>
        Sed molestie tempus &mdash; <b>elementum</b>.
      </p>
      <p>
        Nulla eget egestas magna, non luctus magna. Praesent a tellus molestie nisi feugiat commodo quis vel tellus.
        Praesent scelerisque turpis et diam cursus, non sodales erat tincidunt.
      </p>
      <p>Etiam accumsan neque eu vulputate aliquet. Nulla sit amet sollicitudin velit.</p>
      <p>Pellentesque bibendum semper tortor id venenatis.</p>
    </div>
  )
}

function Block({ children, noMargin }: { children: React.ReactNode; noMargin?: true }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-color)',
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
