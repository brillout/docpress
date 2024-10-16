export { Page }

import React from 'react'
import { Contributors, Emoji, Sponsors, Consulting } from '@brillout/docpress'
import CodeBlock from './CodeBlock.mdx'

function Page() {
  return (
    <>
      <Block noMargin>
        <Header />
      </Block>
      <Block>
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
      <h1 style={{ textAlign: 'center' }}>Introduction</h1>
    </>
  )
}

function Features() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
      }}
    >
      <div>
        <h2>
          <Emoji name="wrench" /> Feature 1
        </h2>
        <p>
          Praesent eu augue lacinia, tincidunt purus nec, ultrices ante. Donec dolor felis, ornare vel augue
          condimentum.
        </p>
        <p>
          Mauris <code>foo</code> quis scelerisque erat.
        </p>
      </div>
      <div>
        <h2>
          <Emoji name="package" /> Feature 2
        </h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>
          <b>Curabitur</b> gravida urna id ligula volutpat dapibus. Integer accumsan dignissim efficitur. Sed mauris
          tortor, lobortis at suscipit ac, ultricies eu nunc.
        </p>
      </div>

      <div>
        <h2>
          <Emoji name="dizzy" /> Feature 3
        </h2>
        <p>
          Sed molestie tempus &mdash; <b>elementum</b>.
        </p>
        <CodeBlock />
      </div>

      <div>
        <h2>
          <Emoji name="mechanical-arm" /> Feature 4
        </h2>
        <p>
          Nulla eget egestas magna, non luctus magna. Praesent a tellus molestie nisi feugiat commodo quis vel tellus.
          Praesent scelerisque turpis et diam cursus, non sodales erat tincidunt.
        </p>
        <p>Etiam accumsan neque eu vulputate aliquet. Nulla sit amet sollicitudin velit.</p>
        <p>Pellentesque bibendum semper tortor id venenatis.</p>
      </div>
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
