import { describe, it, expect } from 'vitest'
import { determineNavItemsColumnLayout } from './determineNavItemsColumnLayout'
import type { NavItem } from './NavItemComponent'

describe('determineNavItemsColumnLayout', () => {
  describe('basic column layout determination', () => {
    it('should assign column indices for simple non-fullWidth categories', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API' },
        { level: 2, title: 'Endpoint 1', titleInNav: 'Endpoint 1' },
        { level: 2, title: 'Endpoint 2', titleInNav: 'Endpoint 2' },
        { level: 1, title: 'Guides', titleInNav: 'Guides' },
        { level: 2, title: 'Guide 1', titleInNav: 'Guide 1' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect({
        api: navItems[0].isPotentialColumn,
        guides: navItems[3].isPotentialColumn,
      }).toMatchInlineSnapshot(`
        {
          "api": {
            "1": 0,
            "2": 0,
          },
          "guides": {
            "1": 0,
            "2": 1,
          },
        }
      `)
    })

    it('should handle multiple columns for categories with many items', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API' },
        { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
        { level: 2, title: 'Item 2', titleInNav: 'Item 2' },
        { level: 2, title: 'Item 3', titleInNav: 'Item 3' },
        { level: 2, title: 'Item 4', titleInNav: 'Item 4' },
        { level: 2, title: 'Item 5', titleInNav: 'Item 5' },
        { level: 2, title: 'Item 6', titleInNav: 'Item 6' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect(navItems[0].isPotentialColumn).toMatchInlineSnapshot(`
        {
          "1": 0,
        }
      `)
    })
  })

  describe('fullWidth categories', () => {
    it('should handle fullWidth categories with level-1 and level-4 items', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
        { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
        { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
        { level: 2, title: 'Post 2', titleInNav: 'Post 2' },
        { level: 4, title: 'Category 2', titleInNav: 'Category 2' },
        { level: 2, title: 'Post 3', titleInNav: 'Post 3' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect({
        level1: navItems[0].isPotentialColumn,
        level4_second: navItems[4].isPotentialColumn,
      }).toMatchInlineSnapshot(`
        {
          "level1": {
            "1": 0,
            "2": 0,
          },
          "level4_second": {
            "1": 0,
            "2": 1,
          },
        }
      `)
    })

    it('should assign columns to level-4 entries that follow other level-4 entries', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
        { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
        { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
        { level: 2, title: 'Post 2', titleInNav: 'Post 2' },
        { level: 4, title: 'Category 2', titleInNav: 'Category 2' },
        { level: 2, title: 'Post 3', titleInNav: 'Post 3' },
        { level: 2, title: 'Post 4', titleInNav: 'Post 4' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect({
        level1: navItems[0].isPotentialColumn,
        level4_second: navItems[4].isPotentialColumn,
      }).toMatchInlineSnapshot(`
        {
          "level1": {
            "1": 0,
            "2": 0,
          },
          "level4_second": {
            "1": 0,
            "2": 1,
          },
        }
      `)
    })
  })

  describe('mixed categories', () => {
    it('should handle mix of fullWidth and non-fullWidth categories', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API' },
        { level: 2, title: 'Endpoint 1', titleInNav: 'Endpoint 1' },
        { level: 1, title: 'Blog', titleInNav: 'Blog', menuModalFullWidth: true },
        { level: 4, title: 'Category 1', titleInNav: 'Category 1' },
        { level: 2, title: 'Post 1', titleInNav: 'Post 1' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect({
        api: navItems[0].isPotentialColumn,
        blog: navItems[2].isPotentialColumn,
        category1: navItems[3].isPotentialColumn,
      }).toMatchInlineSnapshot(`
        {
          "api": {
            "1": 0,
          },
          "blog": {
            "1": 0,
          },
          "category1": undefined,
        }
      `)
    })
  })

  describe('column balancing', () => {
    it('should balance items across columns', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API' },
        { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
        { level: 2, title: 'Item 2', titleInNav: 'Item 2' },
        { level: 2, title: 'Item 3', titleInNav: 'Item 3' },
        { level: 2, title: 'Item 4', titleInNav: 'Item 4' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect(navItems[0].isPotentialColumn).toMatchInlineSnapshot(`
        {
          "1": 0,
        }
      `)
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      const navItems: NavItem[] = [{ level: 1, title: 'Single', titleInNav: 'Single' }]

      determineNavItemsColumnLayout(navItems)

      expect(navItems[0].isPotentialColumn).toMatchInlineSnapshot(`
        {
          "1": 0,
        }
      `)
    })

    it('should handle empty array', () => {
      const navItems: NavItem[] = []

      expect(() => {
        determineNavItemsColumnLayout(navItems)
      }).not.toThrow()
    })

    it('should preserve existing isPotentialColumn values', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API', isPotentialColumn: { 1: 0 } },
        { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect(navItems[0].isPotentialColumn).toMatchInlineSnapshot(`
        {
          "1": 0,
        }
      `)
    })
  })

  describe('column mapping consistency', () => {
    it('should ensure all column entries have consistent mappings', () => {
      const navItems: NavItem[] = [
        { level: 1, title: 'API', titleInNav: 'API' },
        { level: 2, title: 'Item 1', titleInNav: 'Item 1' },
        { level: 2, title: 'Item 2', titleInNav: 'Item 2' },
        { level: 2, title: 'Item 3', titleInNav: 'Item 3' },
        { level: 1, title: 'Guides', titleInNav: 'Guides' },
        { level: 2, title: 'Guide 1', titleInNav: 'Guide 1' },
      ]

      determineNavItemsColumnLayout(navItems)

      expect({
        api: navItems[0].isPotentialColumn,
        guides: navItems[4].isPotentialColumn,
      }).toMatchInlineSnapshot(`
        {
          "api": {
            "1": 0,
            "2": 0,
          },
          "guides": {
            "1": 0,
            "2": 1,
          },
        }
      `)
    })
  })
})
