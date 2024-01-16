export { headings }
export { headingsDetached }

import type { HeadingDefinition, HeadingDetachedDefinition } from '../src'

const headingsDetached: HeadingDetachedDefinition[] = [
  {
    title: 'Orphan Page',
    url: '/orphan'
  },
  {
    title: 'Orphan Page Without Headings',
    url: '/orphan-2'
  },
  {
    title: 'Consulting',
    url: '/consulting'
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
    titleDocument: 'Vike Demo',
    url: '/'
  },
  {
    level: 2,
    title: 'Features',
    url: '/features'
  },
  {
    level: 1,
    title: 'Another Section',
    titleEmoji: 'seedling'
  },
  {
    level: 2,
    title: 'Some Page',
    url: '/some-page'
  },
  {
    level: 2,
    title: 'Tiny Page',
    url: '/tiny'
  },
  {
    level: 2,
    title: 'Press Kit',
    url: '/press'
  }
]
