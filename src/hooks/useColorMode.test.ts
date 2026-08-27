import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useColorMode } from './useColorMode'

describe('useColorMode', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.colorMode
    document.documentElement.style.colorScheme = ''
    window.matchMedia = originalMatchMedia
  })

  it('uses the dataset color mode when present', () => {
    document.documentElement.dataset.colorMode = 'light'
    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('light')
  })

  it('ignores an invalid stored preference', () => {
    localStorage.setItem('color-mode', 'nope')
    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('dark')
  })

  it('uses a stored preference when the dataset is empty', () => {
    localStorage.setItem('color-mode', 'light')
    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('light')
  })

  it('falls back to the system preference', () => {
    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('dark')
  })

  it('toggles mode and persists the choice', () => {
    document.documentElement.dataset.colorMode = 'light'
    const { result } = renderHook(() => useColorMode())
    act(() => {
      result.current.toggleColorMode()
    })
    expect(result.current.mode).toBe('dark')
    expect(localStorage.getItem('color-mode')).toBe('dark')
    expect(document.documentElement.dataset.colorMode).toBe('dark')
    act(() => {
      result.current.toggleColorMode()
    })
    expect(result.current.mode).toBe('light')
    expect(localStorage.getItem('color-mode')).toBe('light')
  })

  it('follows system changes when no preference is stored', () => {
    let onChange: ((event: MediaQueryListEvent) => void) | undefined
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: EventListener) => {
        onChange = listener as (event: MediaQueryListEvent) => void
      },
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
    })) as typeof window.matchMedia

    const { result } = renderHook(() => useColorMode())
    expect(result.current.mode).toBe('light')
    act(() => {
      onChange?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current.mode).toBe('dark')
    act(() => {
      onChange?.({ matches: false } as MediaQueryListEvent)
    })
    expect(result.current.mode).toBe('light')
  })

  it('ignores system changes after the user stores a preference', () => {
    localStorage.setItem('color-mode', 'light')
    let onChange: ((event: MediaQueryListEvent) => void) | undefined
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: EventListener) => {
        onChange = listener as (event: MediaQueryListEvent) => void
      },
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
    })) as typeof window.matchMedia

    const { result } = renderHook(() => useColorMode())
    act(() => {
      onChange?.({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current.mode).toBe('light')
  })
})
