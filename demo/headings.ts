export { headings }
export { headingsDetached }

import type { HeadingDefinition, HeadingDetachedDefinition } from '@brillout/docpress'

const headingsDetached: HeadingDetachedDefinition[] = [
  {
    title: 'Orphan Page',
    url: '/orphan',
  },
  {
    title: 'Orphan Page Without Headings',
    url: '/orphan-2',
  },
  {
    title: 'Consulting',
    url: '/consulting',
  },
  {
    title: 'Languages',
    url: '/languages',
  },
]

const headings: HeadingDefinition[] = [
  {
    level: 1,
    title: 'Overview',
  },
  {
    level: 2,
    title: 'Introduction',
    titleDocument: 'Vike Demo',
    url: '/',
    noSideNavigation: true,
  },
  {
    level: 2,
    title: 'Notes',
    url: '/notes',
  },
  {
    level: 2,
    title: 'Features',
    url: '/features',
  },
  {
    level: 1,
    title: 'Another Section',
  },
  {
    level: 2,
    title: 'Some Page',
    url: '/some-page',
  },
  {
    level: 4,
    title: 'Some category',
  },
  {
    level: 2,
    title: 'Tiny Page',
    url: '/tiny',
  },
  {
    level: 2,
    title: 'June Releases',
    url: '/releases/2024-06',
  },
  {
    level: 2,
    title: 'Press Kit',
    url: '/press',
  },
  {
    level: 2,
    title: 'Page wiht error',
    url: '/error',
  },
  {
    level: 1,
    title: 'Third Section',
  },
  {
    level: 4,
    title: 'Category 1',
  },
  {
    level: 2,
    title: '`Page 1`',
    url: '/page-1',
  },
  {
    level: 4,
    title: 'Category 2',
  },
  {
    level: 2,
    title: 'Page 2',
    url: '/page-2',
  },
]
