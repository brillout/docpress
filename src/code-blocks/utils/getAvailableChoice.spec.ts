import { describe, it, expect } from 'vitest'
import { getAvailableChoice } from './getAvailableChoice.js'
import type { ChoiceItem } from '../../types/Config.js'

describe('getAvailableChoice', () => {
  const choices: ChoiceItem[] = [{ name: 'React' }, { name: 'Vue' }, { name: 'Solid' }]

  it('keeps the selected choice when it is available on the page', () => {
    expect(getAvailableChoice('Vue', choices, ['Solid'], 'React')).toBe('Vue')
  })

  it('falls back to the default when the selected choice is empty on the page (#169)', () => {
    expect(getAvailableChoice('Solid', choices, ['Solid'], 'React')).toBe('React')
  })

  it('falls back to the first available choice when the default is also empty', () => {
    expect(getAvailableChoice('Solid', choices, ['React', 'Solid'], 'React')).toBe('Vue')
  })

  it('keeps the selected choice when nothing is empty', () => {
    expect(getAvailableChoice('Solid', choices, [], 'React')).toBe('Solid')
  })

  it('returns the selected choice as a last resort when every choice is empty', () => {
    expect(getAvailableChoice('Solid', choices, ['React', 'Vue', 'Solid'], 'React')).toBe('Solid')
  })
})
