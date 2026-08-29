import { describe, expect, it } from 'vitest'
import { classifyQrModules } from './classifyQrModules'

describe('classifyQrModules', () => {
  it('tags finder corners, timing, and separators on version 1', () => {
    const grid = classifyQrModules(21)
    expect(grid).toHaveLength(21)
    expect(grid[0]?.[0]).toBe('finderOuter')
    expect(grid[3]?.[3]).toBe('finderCenter')
    expect(grid[1]?.[1]).toBe('finderInner')
    expect(grid[0]?.[14]).toBe('finderOuter')
    expect(grid[14]?.[0]).toBe('finderOuter')
    expect(grid[7]?.[0]).toBe('separator')
    expect(grid[6]?.[10]).toBe('timing')
    expect(grid[10]?.[6]).toBe('timing')
    expect(grid.every((row) => row.every((kind) => kind !== 'alignmentOuter'))).toBe(
      true,
    )
    expect(grid[10]?.[10]).toBe('data')
  })

  it('tags an alignment pattern on version 2', () => {
    const grid = classifyQrModules(25)
    expect(grid[18]?.[18]).toBe('alignmentCenter')
    expect(grid[16]?.[16]).toBe('alignmentOuter')
    expect(grid[17]?.[17]).toBe('alignmentInner')
    expect(grid[6]?.[10]).toBe('timing')
  })
})
