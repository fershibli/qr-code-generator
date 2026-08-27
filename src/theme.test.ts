import { describe, expect, it } from 'vitest'
import { createAppTheme } from './theme'

describe('createAppTheme', () => {
  it('builds a light theme', () => {
    const theme = createAppTheme('light')
    expect(theme.palette.mode).toBe('light')
    expect(theme.palette.primary.main).toBe('#1565c0')
    expect(theme.palette.background.default).toBe('#f4f6fb')
  })

  it('builds a dark theme', () => {
    const theme = createAppTheme('dark')
    expect(theme.palette.mode).toBe('dark')
    expect(theme.palette.primary.main).toBe('#90caf9')
    expect(theme.palette.background.paper).toBe('#1e1e1e')
  })
})
