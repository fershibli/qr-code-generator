import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useElementOutOfView } from './useElementOutOfView'

let observerCallback: IntersectionObserverCallback | null = null

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds = [0]

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function emitIntersecting(isIntersecting: boolean) {
  act(() => {
    observerCallback?.(
      [
        {
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    )
  })
}

describe('useElementOutOfView', () => {
  beforeEach(() => {
    observerCallback = null
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when disabled', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useElementOutOfView(ref, false))
    expect(result.current).toBe(false)
  })

  it('becomes true when the element leaves the viewport', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useElementOutOfView(ref, true))
    expect(result.current).toBe(false)
    emitIntersecting(false)
    expect(result.current).toBe(true)
    emitIntersecting(true)
    expect(result.current).toBe(false)
  })
})
