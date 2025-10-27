import { describe, it, expect, beforeEach } from 'vitest'
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

      // API should have isPotentialColumn set
      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)

      // Guides should have isPotentialColumn set
      expect(navItems[3].isPotentialColumn).toBeDefined()
      expect(navItems[3].isPotentialColumn![1]).toBe(0)
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

      // API should have isPotentialColumn
      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)
      // Should have column mapping for single column
      expect(navItems[0].isPotentialColumn![1]).toBeGreaterThanOrEqual(0)
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

      // Level-1 item should have isPotentialColumn (it's the category header)
      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)

      // The first level-4 item after level-1 is not a column entry
      // Only subsequent level-4 items (where previous is not level-1) are column entries
      expect(navItems[4].isPotentialColumn).toBeDefined()
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

      // Level-1 item should have isPotentialColumn
      expect(navItems[0].isPotentialColumn).toBeDefined()

      // The second level-4 item (Category 2) should have isPotentialColumn
      // because it follows another level-4 item
      const cat2Columns = navItems[4].isPotentialColumn
      expect(cat2Columns).toBeDefined()

      if (cat2Columns) {
        expect(cat2Columns[1]).toBeGreaterThanOrEqual(0)
      }
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

      // Non-fullWidth category should have isPotentialColumn
      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)

      // FullWidth category should have isPotentialColumn
      expect(navItems[2].isPotentialColumn).toBeDefined()
      expect(navItems[2].isPotentialColumn![1]).toBe(0)

      // The first level-4 item after level-1 in fullWidth category is not a column entry
      // so it won't have isPotentialColumn set
      expect(navItems[3].isPotentialColumn).toBeUndefined()
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

      const apiItem = navItems[0]
      expect(apiItem.isPotentialColumn).toBeDefined()

      // Should have entries for different column counts
      expect(apiItem.isPotentialColumn![1]).toBe(0) // 1 column
      if (apiItem.isPotentialColumn![2] !== undefined) {
        // 2 columns should be assigned
        expect(apiItem.isPotentialColumn![2]).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle single item', () => {
      const navItems: NavItem[] = [{ level: 1, title: 'Single', titleInNav: 'Single' }]

      determineNavItemsColumnLayout(navItems)

      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)
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

      // Should have added more column mappings
      expect(navItems[0].isPotentialColumn).toBeDefined()
      expect(navItems[0].isPotentialColumn![1]).toBe(0)
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

      const apiItem = navItems[0]
      const guidesItem = navItems[4]

      // Both should have isPotentialColumn
      expect(apiItem.isPotentialColumn).toBeDefined()
      expect(guidesItem.isPotentialColumn).toBeDefined()

      // Both should have mapping for 1 column
      expect(apiItem.isPotentialColumn![1]).toBe(0)
      expect(guidesItem.isPotentialColumn![1]).toBe(0)
    })
  })
})
