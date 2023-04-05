export { headings }
export { headingsDetached }

import type { HeadingDefinition, HeadingDetachedDefinition } from '@brillout/docpress'

const headingsDetached: HeadingDetachedDefinition[] = [
  {
    title: 'Orphan Page',
    url: '/orphan'
  },
  {
    title: 'Orphan Page Without Headings',
    url: '/orphan-2'
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
    title: 'About',
    url: '/about'
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
  }
]
