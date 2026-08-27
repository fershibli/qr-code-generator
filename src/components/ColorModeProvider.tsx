import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useColorMode } from '../hooks/useColorMode'
import { createAppTheme, type ColorMode } from '../theme'

type ColorModeContextValue = {
  mode: ColorMode
  toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function useColorModeContext(): ColorModeContextValue {
  const value = useContext(ColorModeContext)
  if (!value) {
    throw new Error('useColorModeContext must be used within ColorModeProvider')
  }
  return value
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const { mode, toggleColorMode } = useColorMode()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
