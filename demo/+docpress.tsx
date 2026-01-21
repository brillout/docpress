export { config as default }

import type { Config } from '@brillout/docpress'
import logo from './assets/logo.svg'
import favicon from './assets/favicon.svg'
import { headings, headingsDetached, categories } from './headings'
import { TopNavigation } from './TopNavigation'
import React from 'react'

const config: Config = {
  name: 'Demo',
  version: '0.4.200',
  url: 'fake-website.example.org',
  tagline: 'DocPress Demonstration.',
  logo,
  navLogoSize: 35,
  favicon,

  github: 'https://github.com/brillout/docpress',
  discord: 'https://example.org/some-discord-invite',
  twitter: '@brillout',
  bluesky: 'vike.dev',
  linkedin: 'vikejs',

  headings,
  headingsDetached,
  categories,

  algolia: {
    appId: 'YMV9Y4B58S',
    apiKey: '9ac178c1a29ba00e8afb98365015f677',
    indexName: 'vike',
  },
  /* Avoid network error when running the demo offline.
  // ```console
  // Failed to load script: https://www.googletagmanager.com/gtag/js?id=123456
  // ```
  googleAnalytics: '123456',
  //*/

  // i18n: true,
  pressKit: true,
  docsDir: 'demo',

  // globalNote: <GlobalNoteWarning />,
  topNavigation: <TopNavigation />,
  navMaxWidth: 1140,
  choices: {
    server: {
      choices: ['hono', 'express', 'fastify'],
      default: 'hono',
    },
    'ui-ext': {
      choices: ['vike-react', 'vike-vue', 'vike-solid'],
      default: 'vike-react',
    },
  },
}

/*
function GlobalNoteWarning() {
  return (
    <>
      <div style={{ maxWidth: 500, margin: 'auto' }}>
        <Warning>Some global note.</Warning>
      </div>
    </>
  )
}
*/
