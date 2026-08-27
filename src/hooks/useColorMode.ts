import { useCallback, useEffect, useState } from 'react'
import type { ColorMode } from '../theme'

const STORAGE_KEY = 'color-mode'

function readStoredMode(): ColorMode | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

function applyMode(mode: ColorMode) {
  document.documentElement.dataset.colorMode = mode
  document.documentElement.style.colorScheme = mode
}

function getInitialMode(): ColorMode {
  const fromDataset = document.documentElement.dataset.colorMode
  if (fromDataset === 'light' || fromDataset === 'dark') {
    return fromDataset
  }
  const stored = readStoredMode()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useColorMode() {
  const [mode, setMode] = useState<ColorMode>(getInitialMode)

  const toggleColorMode = useCallback(() => {
    setMode((previous) => {
      const next = previous === 'dark' ? 'light' : 'dark'
      applyMode(next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  useEffect(() => {
    if (readStoredMode()) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredMode()) return
      const next: ColorMode = event.matches ? 'dark' : 'light'
      applyMode(next)
      setMode(next)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return { mode, toggleColorMode }
}
