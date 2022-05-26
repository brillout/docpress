export { headings }
export { headingsWithoutLink }

import type { HeadingDefinition, HeadingWithoutLink } from '../src/headings'

const headingsWithoutLink: HeadingWithoutLink[] = [
  {
    title: 'Migration',
    url: '/migration'
  },
  {
    title: 'Custom Exports & Custom Hooks',
    url: '/exports'
  }
]

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: 'Overview',
    titleEmoji: 'compass'
  },
  {
    level: 2,
    title: 'Introduction',
    titleDocument: 'vite-plugin-ssr',
    url: '/'
  },
  /*
  {
    level: 2,
    title: 'What is Server-side Rendering (SSR)?',
    url: '/ssr',
  },
  */
  {
    level: 2,
    title: 'Vue Tour',
    url: '/about'
  },
  {
    level: 2,
    title: 'React Tour',
    url: '/react-tour'
  },
  {
    level: 1,
    title: 'Get Started',
    titleEmoji: 'seedling'
  },
  {
    level: 2,
    title: 'Scaffold new app',
    url: '/scaffold'
  }
]
