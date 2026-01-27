import { describe, it, expect } from 'vitest'
import { determineNavItemsColumnLayout } from './determineNavItemsColumnLayout.js'
import type { NavItem } from './NavItemComponent.js'

describe('determineNavItemsColumnLayout', () => {
  it('should handle simple non-fullWidth categories', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'API', titleInNav: 'API' },
      { level: 2, title: 'Endpoint 1', titleInNav: 'Endpoint 1' },
      { level: 2, title: 'Endpoint 2', titleInNav: 'Endpoint 2' },
      { level: 1, title: 'Guides', titleInNav: 'Guides' },
      { level: 2, title: 'Guide 1', titleInNav: 'Guide 1' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
          },
          "level": 1,
          "title": "API",
          "titleInNav": "API",
        },
        {
          "level": 2,
          "title": "Endpoint 1",
          "titleInNav": "Endpoint 1",
        },
        {
          "level": 2,
          "title": "Endpoint 2",
          "titleInNav": "Endpoint 2",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
          },
          "level": 1,
          "title": "Guides",
          "titleInNav": "Guides",
        },
        {
          "level": 2,
          "title": "Guide 1",
          "titleInNav": "Guide 1",
        },
      ]
    `)
  })

  it('should handle fullWidth categories with level-4 items', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
      { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
      { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
      { level: 2, title: 'Post 2', titleInNav: 'Post 2' },
      { level: 4, title: 'Category 2', titleInNav: 'Category 2' },
      { level: 2, title: 'Post 3', titleInNav: 'Post 3' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
          },
          "level": 1,
          "menuModalFullWidth": true,
          "title": "Blog",
          "titleInNav": "Blog",
        },
        {
          "level": 4,
          "title": "Category 1",
          "titleInNav": "Category 1",
        },
        {
          "level": 2,
          "title": "Post 1",
          "titleInNav": "Post 1",
        },
        {
          "level": 2,
          "title": "Post 2",
          "titleInNav": "Post 2",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
          },
          "level": 4,
          "title": "Category 2",
          "titleInNav": "Category 2",
        },
        {
          "level": 2,
          "title": "Post 3",
          "titleInNav": "Post 3",
        },
      ]
    `)
  })

  it('should handle mix of fullWidth and non-fullWidth categories', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'API', titleInNav: 'API' },
      { level: 2, title: 'Endpoint 1', titleInNav: 'Endpoint 1' },
      { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
      { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
      { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
          },
          "level": 1,
          "title": "API",
          "titleInNav": "API",
        },
        {
          "level": 2,
          "title": "Endpoint 1",
          "titleInNav": "Endpoint 1",
        },
        {
          "isPotentialColumn": {
            "1": 0,
          },
          "level": 1,
          "menuModalFullWidth": true,
          "title": "Blog",
          "titleInNav": "Blog",
        },
        {
          "level": 4,
          "title": "Category 1",
          "titleInNav": "Category 1",
        },
        {
          "level": 2,
          "title": "Post 1",
          "titleInNav": "Post 1",
        },
      ]
    `)
  })

  it('should handle single category', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'Single', titleInNav: 'Single' },
      { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
          },
          "level": 1,
          "title": "Single",
          "titleInNav": "Single",
        },
        {
          "level": 2,
          "title": "Item 1",
          "titleInNav": "Item 1",
        },
      ]
    `)
  })

  it('should handle empty array', () => {
    const navItems: NavItem[] = []

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      []
    `)
  })

  it('should handle multiple level-4 entries in fullWidth category', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
      { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
      { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
      { level: 4, title: 'Category 2', titleInNav: 'Category 2' },
      { level: 2, title: 'Post 2', titleInNav: 'Post 2' },
      { level: 4, title: 'Category 3', titleInNav: 'Category 3' },
      { level: 2, title: 'Post 3', titleInNav: 'Post 3' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
            "3": 0,
          },
          "level": 1,
          "menuModalFullWidth": true,
          "title": "Blog",
          "titleInNav": "Blog",
        },
        {
          "level": 4,
          "title": "Category 1",
          "titleInNav": "Category 1",
        },
        {
          "level": 2,
          "title": "Post 1",
          "titleInNav": "Post 1",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
            "3": 1,
          },
          "level": 4,
          "title": "Category 2",
          "titleInNav": "Category 2",
        },
        {
          "level": 2,
          "title": "Post 2",
          "titleInNav": "Post 2",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
            "3": 2,
          },
          "level": 4,
          "title": "Category 3",
          "titleInNav": "Category 3",
        },
        {
          "level": 2,
          "title": "Post 3",
          "titleInNav": "Post 3",
        },
      ]
    `)
  })

  it('should handle many items in single category', () => {
    const navItems: NavItem[] = [
      { level: 1, title: 'API', titleInNav: 'API' },
      { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
      { level: 2, title: 'Item 2', titleInNav: 'Item 2' },
      { level: 2, title: 'Item 3', titleInNav: 'Item 3' },
      { level: 2, title: 'Item 4', titleInNav: 'Item 4' },
      { level: 2, title: 'Item 5', titleInNav: 'Item 5' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
          },
          "level": 1,
          "title": "API",
          "titleInNav": "API",
        },
        {
          "level": 2,
          "title": "Item 1",
          "titleInNav": "Item 1",
        },
        {
          "level": 2,
          "title": "Item 2",
          "titleInNav": "Item 2",
        },
        {
          "level": 2,
          "title": "Item 3",
          "titleInNav": "Item 3",
        },
        {
          "level": 2,
          "title": "Item 4",
          "titleInNav": "Item 4",
        },
        {
          "level": 2,
          "title": "Item 5",
          "titleInNav": "Item 5",
        },
      ]
    `)
  })

  it('should handle demo headings structure', () => {
    // Duplicated from demo/headings.ts
    const navItems: NavItem[] = [
      { level: 1, title: 'Overview', titleInNav: 'Overview' },
      { level: 2, title: 'Introduction', titleInNav: 'Introduction' },
      { level: 2, title: 'Notes', titleInNav: 'Notes' },
      { level: 2, title: 'Features', titleInNav: 'Features' },
      { level: 2, title: 'Open Source Pricing', titleInNav: 'Open Source Pricing' },

      { level: 1, title: 'Guides', titleInNav: 'Guides' },
      { level: 2, title: 'Some Page', titleInNav: 'Some Page' },
      { level: 4, title: 'Some category', titleInNav: 'Some category' },
      { level: 2, title: 'Tiny Page', titleInNav: 'Tiny Page' },
      { level: 2, title: 'June Releases', titleInNav: 'June Releases' },
      { level: 2, title: 'Press Kit', titleInNav: 'Press Kit' },
      { level: 2, title: 'Page wiht error', titleInNav: 'Page wiht error' },

      { level: 1, title: 'API', titleInNav: 'API', menuModalFullWidth: true },
      { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
      { level: 2, title: '`Page 1`', titleInNav: '`Page 1`' },
      { level: 4, title: 'Category 2', titleInNav: 'Category 2' },
      { level: 2, title: 'Page 2', titleInNav: 'Page 2' },
      { level: 4, title: 'Category 3', titleInNav: 'Category 3' },
      { level: 2, title: 'Page 3', titleInNav: 'Page 3' },
      { level: 2, title: 'Page 4', titleInNav: 'Page 4' },

      { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
      { level: 4, title: 'Blog Category 1', titleInNav: 'Blog Category 1' },
      { level: 2, title: 'Some Blog Post', titleInNav: 'Some Blog Post' },
      { level: 4, title: 'Blog Category 2', titleInNav: 'Blog Category 2' },
      { level: 2, title: 'Some Other Blog Post', titleInNav: 'Some Other Blog Post' },
    ]

    determineNavItemsColumnLayout(navItems)

    expect(navItems).toMatchInlineSnapshot(`
      [
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
          },
          "level": 1,
          "title": "Overview",
          "titleInNav": "Overview",
        },
        {
          "level": 2,
          "title": "Introduction",
          "titleInNav": "Introduction",
        },
        {
          "level": 2,
          "title": "Notes",
          "titleInNav": "Notes",
        },
        {
          "level": 2,
          "title": "Features",
          "titleInNav": "Features",
        },
        {
          "level": 2,
          "title": "Open Source Pricing",
          "titleInNav": "Open Source Pricing",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
          },
          "level": 1,
          "title": "Guides",
          "titleInNav": "Guides",
        },
        {
          "level": 2,
          "title": "Some Page",
          "titleInNav": "Some Page",
        },
        {
          "level": 4,
          "title": "Some category",
          "titleInNav": "Some category",
        },
        {
          "level": 2,
          "title": "Tiny Page",
          "titleInNav": "Tiny Page",
        },
        {
          "level": 2,
          "title": "June Releases",
          "titleInNav": "June Releases",
        },
        {
          "level": 2,
          "title": "Press Kit",
          "titleInNav": "Press Kit",
        },
        {
          "level": 2,
          "title": "Page wiht error",
          "titleInNav": "Page wiht error",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
            "3": 0,
          },
          "level": 1,
          "menuModalFullWidth": true,
          "title": "API",
          "titleInNav": "API",
        },
        {
          "level": 4,
          "title": "Category 1",
          "titleInNav": "Category 1",
        },
        {
          "level": 2,
          "title": "\`Page 1\`",
          "titleInNav": "\`Page 1\`",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
            "3": 1,
          },
          "level": 4,
          "title": "Category 2",
          "titleInNav": "Category 2",
        },
        {
          "level": 2,
          "title": "Page 2",
          "titleInNav": "Page 2",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
            "3": 2,
          },
          "level": 4,
          "title": "Category 3",
          "titleInNav": "Category 3",
        },
        {
          "level": 2,
          "title": "Page 3",
          "titleInNav": "Page 3",
        },
        {
          "level": 2,
          "title": "Page 4",
          "titleInNav": "Page 4",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 0,
          },
          "level": 1,
          "menuModalFullWidth": true,
          "title": "Blog",
          "titleInNav": "Blog",
        },
        {
          "level": 4,
          "title": "Blog Category 1",
          "titleInNav": "Blog Category 1",
        },
        {
          "level": 2,
          "title": "Some Blog Post",
          "titleInNav": "Some Blog Post",
        },
        {
          "isPotentialColumn": {
            "1": 0,
            "2": 1,
          },
          "level": 4,
          "title": "Blog Category 2",
          "titleInNav": "Blog Category 2",
        },
        {
          "level": 2,
          "title": "Some Other Blog Post",
          "titleInNav": "Some Other Blog Post",
        },
      ]
    `)
  })
})
