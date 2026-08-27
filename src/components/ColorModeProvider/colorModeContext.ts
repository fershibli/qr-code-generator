import { createContext, useContext } from 'react'
import type { ColorMode } from '../../theme'

export type ColorModeContextValue = {
  mode: ColorMode
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function useColorModeContext(): ColorModeContextValue {
  const value = useContext(ColorModeContext)
  if (!value) {
    throw new Error('useColorModeContext must be used within ColorModeProvider')
  }
  return value
}
